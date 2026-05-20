import { onMount } from 'svelte';
import { writable } from 'svelte/store';
import { taskVariables, correctAnswer } from '../stores/taskStore.js';

/**
 * Common task lifecycle helper. Call at the top level of a Task*.svelte script.
 *
 * @param {() => { vars: Record<string, unknown>, answer: unknown }} computeFn
 *   Function that computes task variables and the correct answer.
 *   Called once on component mount with crypto-safe randomness.
 * @returns {import('svelte/store').Readable<Record<string, unknown> | null>}
 *   A readable store of the computed variables (null before mount).
 */
export function setupTask(computeFn) {
  const varsStore = writable(null);

  onMount(() => {
    const { vars, answer } = computeFn();
    varsStore.set(vars);
    taskVariables.set(vars);
    correctAnswer.set(answer);
  });

  return varsStore;
}
