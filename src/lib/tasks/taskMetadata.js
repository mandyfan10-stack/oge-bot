/**
 * @typedef {Object} TaskMeta
 * @property {string} id            String id, '1'..'20'.
 * @property {string} number        Padded display number, '01'..'20'.
 * @property {string} title         Short Russian title.
 * @property {string} topic         Topic family (Информатика sub-area).
 * @property {string} searchable    Lowercased haystack used by the filter.
 */

/** Raw catalogue. Order matches Task[N].svelte. */
const RAW = [
  { id: '1',  title: 'Объём информации',  topic: 'Кодирование' },
  { id: '2',  title: 'Шифровальщик',      topic: 'Кодирование' },
  { id: '3',  title: 'Логика',            topic: 'Логика' },
  { id: '4',  title: 'Маршруты',          topic: 'Графы' },
  { id: '5',  title: 'Анализ алгоритма',  topic: 'Алгоритмы' },
  { id: '6',  title: 'Анализ программы',  topic: 'Алгоритмы' },
  { id: '7',  title: 'Сборка URL',        topic: 'Поиск в Сети' },
  { id: '8',  title: 'Множества',         topic: 'Запросы' },
  { id: '9',  title: 'Количество путей',  topic: 'Графы' },
  { id: '10', title: 'Системы счисления', topic: 'Числа' },
  { id: '11', title: 'Поиск',             topic: 'Файлы' },
  { id: '12', title: 'Маски файлов',      topic: 'Файлы' },
  { id: '13', title: 'Редактор',          topic: 'Алгоритмы' },
  { id: '14', title: 'Таблицы',           topic: 'Excel' },
  { id: '15', title: 'Робот',             topic: 'Исполнители' },
  { id: '16', title: 'Цикл FOR',          topic: 'Программирование' },
  { id: '17', title: 'Списки',            topic: 'Программирование' },
  { id: '18', title: 'Функции',           topic: 'Программирование' },
  { id: '19', title: 'IP-адреса',         topic: 'Сети' },
  { id: '20', title: 'Устройство ПК',     topic: 'Аппаратура' },
];

/** @type {ReadonlyArray<TaskMeta>} */
export const TASK_LIST = Object.freeze(
  RAW.map((t) => ({
    id: t.id,
    number: t.id.padStart(2, '0'),
    title: t.title,
    topic: t.topic,
    searchable: `${t.id} ${t.title} ${t.topic}`.toLowerCase(),
  }))
);

/** @type {ReadonlyMap<string, TaskMeta>} */
export const TASK_INDEX = Object.freeze(new Map(TASK_LIST.map((t) => [t.id, t])));

/**
 * Linear filter — with 20 items the algorithmic complexity is irrelevant,
 * but `searchable` is precomputed so each keystroke is O(n) substring scan
 * with no allocation per row.
 * @param {string} query
 * @returns {ReadonlyArray<TaskMeta>}
 */
export function filterTasks(query) {
  const q = query.trim().toLowerCase();
  if (!q) return TASK_LIST;
  return TASK_LIST.filter((t) => t.searchable.includes(q));
}
