import { getInitData } from '../util/telegram.js';

const API_URL = import.meta.env.VITE_API_URL || 'https://oge-backend.onrender.com';

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

async function extractErrorMessage(response) {
  try {
    const data = await response.json();
    return data.reply || data.message || data.error || null;
  } catch {
    return null;
  }
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
      signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new ChatError(GENERIC_NETWORK_ERROR);
  }

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new ChatError(message || GENERIC_NETWORK_ERROR, response.status);
  }

  if (!response.body) {
    // No streaming support — fall back to text.
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
}
