import { writable, get } from 'svelte/store';
import { getUserId } from '../util/telegram.js';

function getKey() {
  const uid = getUserId();
  return uid ? `uid:${uid}:oge-bot:progress:v1` : 'oge-bot:progress:v1';
}

function loadProgress() {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(getKey());
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function saveProgress(data) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(getKey(), JSON.stringify(data));
  } catch {}
}

/** @type {import('svelte/store').Writable<Record<string, {attempts: number, correct: boolean, lastTs: number}>>} */
const _store = writable(loadProgress());

_store.subscribe(saveProgress);

export const progress = {
  subscribe: _store.subscribe,
  recordAttempt(taskId, isCorrect) {
    _store.update((data) => {
      const prev = data[taskId] ?? { attempts: 0, correct: false, lastTs: 0 };
      return {
        ...data,
        [taskId]: {
          attempts: prev.attempts + 1,
          correct: prev.correct || isCorrect,
          lastTs: Date.now(),
        },
      };
    });
  },
  getProgress(taskId) {
    const data = get(_store);
    return data[taskId] ?? { attempts: 0, correct: false, lastTs: 0 };
  },
};
