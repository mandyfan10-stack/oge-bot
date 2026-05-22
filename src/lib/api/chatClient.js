import { getInitData } from '../util/telegram.js';

const API_URL = import.meta.env.VITE_API_URL || 'https://oge-backend.onrender.com';
const REQUEST_TIMEOUT_MS = 90_000;

/**
 * @typedef {Object} ChatMessage
 * @property {'user' | 'assistant'} role
 * @property {string} content
 */

export class ChatError extends Error {
  /** @param {string} userMessage  @param {number} [status] */
  constructor(userMessage, status) {
    super(userMessage);
    this.name = 'ChatError';
    this.userMessage = userMessage;
    this.status = status;
  }
}

const GENERIC_NETWORK_ERROR =
  'Не удалось связаться с сервером. Проверьте соединение и попробуйте снова.';

const AUTH_ERROR =
  'Авторизация Telegram не пройдена. Перезапустите мини-приложение через бота.';

const TIMEOUT_ERROR =
  'Сервер не ответил за 90 секунд. Возможно, сервер просыпается — попробуйте ещё раз.';

function stringifyDetail(value) {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => {
        if (item == null) return null;
        if (typeof item === 'string') return item;
        if (typeof item === 'object') return item.msg || item.message || item.detail || null;
        return String(item);
      })
      .filter(Boolean);
    return parts.length ? parts.join('; ') : null;
  }
  if (typeof value === 'object') {
    return value.msg || value.message || value.detail || null;
  }
  return String(value);
}

async function extractErrorMessage(response) {
  let text;
  try {
    text = await response.text();
  } catch {
    return null;
  }
  if (!text) return null;
  try {
    const data = JSON.parse(text);
    return (
      stringifyDetail(data.reply) ||
      stringifyDetail(data.message) ||
      stringifyDetail(data.error) ||
      stringifyDetail(data.detail) ||
      null
    );
  } catch {
    return text.slice(0, 200);
  }
}

function messageForStatus(status, message) {
  if (status === 401 || status === 403) return AUTH_ERROR;
  if (status === 422) {
    return 'Не удалось отправить сообщение. Попробуйте очистить чат и отправить снова.';
  }
  if (status >= 500) {
    return `${message || 'Сервер недоступен'} (HTTP ${status}). Попробуйте через минуту.`;
  }
  return message || GENERIC_NETWORK_ERROR;
}

/**
 * Stream tokens from POST /api/chat.
 *
 * @param {Object} params
 * @param {string} params.text
 * @param {ReadonlyArray<ChatMessage>} params.history
 * @param {string|null} params.taskDescription
 * @param {AbortSignal} [params.signal]
 * @returns {AsyncGenerator<string, void, void>}
 */
export async function* sendChatMessage({ text, history, taskDescription, signal }) {
  const internalCtrl = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    internalCtrl.abort();
  }, REQUEST_TIMEOUT_MS);

  const onExternalAbort = () => internalCtrl.abort();
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      throw new DOMException('Aborted', 'AbortError');
    }
    signal.addEventListener('abort', onExternalAbort, { once: true });
  }

  try {
    let response;
    try {
      response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': getInitData(),
        },
        body: JSON.stringify({
          history,
          text,
          task_description: taskDescription,
        }),
        signal: internalCtrl.signal,
      });
    } catch (err) {
      if (signal?.aborted) throw err;
      if (timedOut) {
        console.error('Chat API timeout', { url: API_URL, timeoutMs: REQUEST_TIMEOUT_MS });
        throw new ChatError(TIMEOUT_ERROR);
      }
      console.error('Chat API fetch failed', err);
      throw new ChatError(GENERIC_NETWORK_ERROR);
    }

    if (!response.ok) {
      const body = await extractErrorMessage(response);
      console.error('Chat API error', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        body,
      });
      throw new ChatError(messageForStatus(response.status, body), response.status);
    }

    if (!response.body) {
      const fallback = await response.text();
      if (fallback) yield fallback;
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) yield chunk;
      }
      const tail = decoder.decode();
      if (tail) yield tail;
    } finally {
      try { reader.releaseLock(); } catch { /* ignore */ }
    }
  } finally {
    clearTimeout(timeoutId);
    if (signal) signal.removeEventListener('abort', onExternalAbort);
  }
}
