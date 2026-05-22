import { onMount } from 'svelte';
import { writable } from 'svelte/store';
import { taskVariables, correctAnswer, taskSolution, chatContextVars } from '../stores/taskStore.js';

/**
 * Common task lifecycle helper. Call at the top level of a Task*.svelte script.
 *
 * @param {() => {
 *   vars: Record<string, unknown>,
 *   answer: unknown,
 *   solution?: string,
 *   hideFromChat?: ReadonlyArray<string>
 * }} computeFn
 * @returns {import('svelte/store').Readable<Record<string, unknown> | null>}
 */
export function setupTask(computeFn) {
  const varsStore = writable(null);

  onMount(() => {
    const { vars, answer, solution, hideFromChat = [] } = computeFn();
    varsStore.set(vars);
    taskVariables.set(vars);
    correctAnswer.set(answer);
    taskSolution.set(solution ?? '');

    // Strip answer-revealing keys before publishing to chat context.
    const chatVars = { ...vars };
    for (const key of hideFromChat) delete chatVars[key];
    chatContextVars.set(chatVars);
  });

  return varsStore;
}
