import { writable, derived, get } from 'svelte/store';
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

/**
 * @typedef {Object} TaskProgress
 * @property {number} attempts      Total answer checks for the task.
 * @property {number} correctCount  How many of those checks were correct.
 * @property {boolean} correct      Ever answered correctly (solved flag).
 * @property {number} lastTs        Timestamp of the last attempt.
 */

const EMPTY_ENTRY = { attempts: 0, correctCount: 0, correct: false, lastTs: 0 };

/** @type {import('svelte/store').Writable<Record<string, TaskProgress>>} */
const _store = writable(loadProgress());

_store.subscribe(saveProgress);

export const progress = {
  subscribe: _store.subscribe,
  recordAttempt(taskId, isCorrect) {
    _store.update((data) => {
      const prev = data[taskId] ?? EMPTY_ENTRY;
      return {
        ...data,
        [taskId]: {
          attempts: prev.attempts + 1,
          // `correctCount` was added later — older persisted entries may
          // miss it, hence the ?? 0 fallback.
          correctCount: (prev.correctCount ?? 0) + (isCorrect ? 1 : 0),
          correct: prev.correct || isCorrect,
          lastTs: Date.now(),
        },
      };
    });
  },
  getProgress(taskId) {
    const data = get(_store);
    return data[taskId] ?? EMPTY_ENTRY;
  },
  reset() {
    _store.set({});
  },
};

/**
 * Aggregated stats across all tasks, for the profile dashboard.
 * @type {import('svelte/store').Readable<{
 *   solved: number, attempted: number, totalAttempts: number,
 *   totalCorrect: number, accuracy: number|null, lastTs: number
 * }>}
 */
export const progressStats = derived(_store, (data) => {
  let solved = 0;
  let attempted = 0;
  let totalAttempts = 0;
  let totalCorrect = 0;
  let lastTs = 0;
  for (const entry of Object.values(data)) {
    if (!entry || typeof entry !== 'object') continue;
    const attempts = entry.attempts ?? 0;
    if (attempts > 0) attempted += 1;
    totalAttempts += attempts;
    totalCorrect += entry.correctCount ?? 0;
    if (entry.correct) solved += 1;
    if ((entry.lastTs ?? 0) > lastTs) lastTs = entry.lastTs;
  }
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : null;
  return { solved, attempted, totalAttempts, totalCorrect, accuracy, lastTs };
});
