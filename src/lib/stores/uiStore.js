import { writable } from 'svelte/store';

/**
 * @typedef {'profile' | 'tasks' | 'messages' | 'settings'} Section
 */

/** @type {import('svelte/store').Writable<Section>} */
export const currentSection = writable('profile');
