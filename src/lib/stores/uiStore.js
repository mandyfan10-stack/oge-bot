import { writable } from 'svelte/store';

/**
 * @typedef {'profile' | 'practice' | 'tasks' | 'messages' | 'settings'} Section
 * profile  — дашборд со статистикой («Моя страница»)
 * practice — решение текущего задания (TaskRunner)
 * tasks    — каталог 20 заданий
 * messages — чат с ИИ-репетитором
 * settings — настройки
 */

/** @type {import('svelte/store').Writable<Section>} */
export const currentSection = writable('profile');
