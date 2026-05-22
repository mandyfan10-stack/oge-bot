import { writable, get } from 'svelte/store';
import { getUserId } from '../util/telegram.js';

/**
 * @typedef {Object} ChatMessage
 * @property {'user' | 'assistant'} role
 * @property {string} content
 * @property {number} ts  Epoch ms when the message was created.
 */

function getStorageKey() {
  const uid = getUserId();
  return uid ? `uid:${uid}:oge-bot:chat-history:v1` : 'oge-bot:chat-history:v1';
}
const MAX_PERSIST = 50;

// Backend rejects history items with empty content (min_length=1) → HTTP 422.
// We must never persist, restore, or transmit a message whose content is
// empty or whitespace-only (e.g. a placeholder left over from an interrupted
// stream).
function isNonEmptyMessage(m) {
  return (
    m &&
    (m.role === 'user' || m.role === 'assistant') &&
    typeof m.content === 'string' &&
    m.content.trim().length > 0
  );
}

function loadInitial() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isNonEmptyMessage);
  } catch (err) {
    console.debug('[chatStore] localStorage parse failed:', err);
    return [];
  }
}

function persist(messages) {
  if (typeof localStorage === 'undefined') return;
  try {
    const safe = messages
      .filter(isNonEmptyMessage)
      .slice(-MAX_PERSIST)
      .map((m) => ({ role: m.role, content: m.content, ts: m.ts ?? Date.now() }));
    localStorage.setItem(getStorageKey(), JSON.stringify(safe));
  } catch (err) {
    console.debug('[chatStore] localStorage write failed:', err);
  }
}

/** @type {import('svelte/store').Writable<ChatMessage[]>} */
const chatHistory = writable(loadInitial());

chatHistory.subscribe(persist);

/* ----------------------------------------------------------------------
 * rAF-coalesced append: during streaming we receive many small chunks.
 * Instead of triggering a Svelte re-render per token (the previous
 * `chatHistory = chatHistory` hack), we mutate the in-memory message,
 * mark it dirty, and flush a single store.set() per animation frame.
 * ---------------------------------------------------------------------- */
let pendingFlush = false;
function schedulePublish() {
  if (pendingFlush) return;
  pendingFlush = true;
  const raf =
    typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame
      : (cb) => setTimeout(cb, 16);
  raf(() => {
    pendingFlush = false;
    chatHistory.update((arr) => arr.slice()); // fresh reference → reactivity
  });
}

function appendMessage(msg) {
  chatHistory.update((arr) => [...arr, msg]);
}

export const chat = {
  subscribe: chatHistory.subscribe,
  /** Append a complete user message. */
  pushUser(content) {
    appendMessage({ role: 'user', content, ts: Date.now() });
  },
  /** Append an empty assistant placeholder that will be filled by streaming. */
  startAssistant() {
    appendMessage({ role: 'assistant', content: '', ts: Date.now() });
  },
  /** Append a chunk to the *last* assistant message (rAF-batched). */
  appendAssistantChunk(chunk) {
    if (!chunk) return;
    const arr = get(chatHistory);
    if (!arr.length || arr[arr.length - 1].role !== 'assistant') return;
    arr[arr.length - 1].content += chunk;
    schedulePublish();
  },
  /** Overwrite the last assistant message's content (used for error fallback). */
  setLastAssistant(content) {
    chatHistory.update((arr) => {
      if (!arr.length || arr[arr.length - 1].role !== 'assistant') return arr;
      const next = arr.slice();
      next[next.length - 1] = { ...next[next.length - 1], content };
      return next;
    });
  },
  /** Drop the trailing empty assistant placeholder (cleanup after error before any chunk arrived). */
  dropTrailingEmptyAssistant() {
    chatHistory.update((arr) => {
      if (!arr.length) return arr;
      const last = arr[arr.length - 1];
      if (last.role === 'assistant' && !last.content) return arr.slice(0, -1);
      return arr;
    });
  },
  clear() {
    chatHistory.set([]);
  },
  /** Snapshot used for sending the recent context to the backend.
   *  Filters out any empty/whitespace-only messages — sending them would
   *  cause the backend to return HTTP 422. */
  recent(n = 15) {
    return get(chatHistory)
      .filter(isNonEmptyMessage)
      .slice(-n)
      .map((m) => ({ role: m.role, content: m.content }));
  },
};
