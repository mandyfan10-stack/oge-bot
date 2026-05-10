import { writable } from 'svelte/store';

// Replaces the global window.taskState
export const currentTask = writable(null);
export const taskVariables = writable({});
export const correctAnswer = writable(null);
