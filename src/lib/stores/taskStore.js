import { writable } from 'svelte/store';
import { getUserId } from '../util/telegram.js';

function lastTaskKey() {
  const uid = getUserId();
  return uid ? `uid:${uid}:oge-bot:last-task` : 'oge-bot:last-task';
}

function loadLastTask() {
  if (typeof localStorage === 'undefined') return null;
  try { return localStorage.getItem(lastTaskKey()) || null; } catch { return null; }
}

/**
 * @typedef {Record<string, unknown>} TaskVariables
 * Per-task randomized state set by each Task[N].svelte component on mount.
 */

/** Currently selected task id, as a string '1'..'20' (or null on first load).
 *  @type {import('svelte/store').Writable<string|null>} */
export const currentTask = writable(loadLastTask());

currentTask.subscribe((id) => {
  if (!id || typeof localStorage === 'undefined') return;
  try { localStorage.setItem(lastTaskKey(), id); } catch {}
});

/** Per-task randomized data set by the active task component.
 *  @type {import('svelte/store').Writable<TaskVariables>} */
export const taskVariables = writable({});

/** Subset of taskVariables exposed to the AI chat context. Tasks declare a
 *  `hideFromChat` list in their setupTask return so answer-revealing keys
 *  (e.g. `target`, `ans`, `count`) never reach the backend prompt.
 *  @type {import('svelte/store').Writable<TaskVariables>} */
export const chatContextVars = writable({});

/** Expected answer for the active task. Used by Task*.svelte locally only —
 *  it is never sent to the backend (the chat receives `chatContextVars`).
 *  Never persist this to localStorage.
 *  @type {import('svelte/store').Writable<unknown>} */
export const correctAnswer = writable(null);

/** Worked solution string shown after a correct answer.
 *  @type {import('svelte/store').Writable<string>} */
export const taskSolution = writable('');
