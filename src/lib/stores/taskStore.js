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

/** Expected answer for the active task.
 *
 *  ⚠️ SECURITY: see TODO in AIChat.svelte / server.py — until the backend
 *  exposes a task_id lookup, this value is still read into the chat
 *  request, which leaks the answer to anyone inspecting network traffic.
 *  Never persist this to localStorage.
 *  @type {import('svelte/store').Writable<unknown>} */
export const correctAnswer = writable(null);
