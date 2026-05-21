import { onMount } from 'svelte';
import { writable } from 'svelte/store';
import { taskVariables, correctAnswer, taskSolution } from '../stores/taskStore.js';

/**
 * Common task lifecycle helper. Call at the top level of a Task*.svelte script.
 *
 * @param {() => { vars: Record<string, unknown>, answer: unknown, solution?: string }} computeFn
 * @returns {import('svelte/store').Readable<Record<string, unknown> | null>}
 */
export function setupTask(computeFn) {
  const varsStore = writable(null);

  onMount(() => {
    const { vars, answer, solution } = computeFn();
    varsStore.set(vars);
    taskVariables.set(vars);
    correctAnswer.set(answer);
    taskSolution.set(solution ?? '');
  });

  return varsStore;
}
