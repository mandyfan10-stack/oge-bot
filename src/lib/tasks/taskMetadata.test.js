import { describe, it, expect } from 'vitest';
import { TASK_LIST, TASK_INDEX, filterTasks } from './taskMetadata.js';

describe('TASK_LIST', () => {
  it('has 20 tasks', () => {
    expect(TASK_LIST).toHaveLength(20);
  });

  it('ids are strings 1..20', () => {
    const ids = TASK_LIST.map((t) => t.id);
    for (let i = 1; i <= 20; i++) {
      expect(ids).toContain(String(i));
    }
  });

  it('each task has required fields', () => {
    for (const task of TASK_LIST) {
      expect(task.id).toBeTruthy();
      expect(task.title).toBeTruthy();
      expect(task.topic).toBeTruthy();
      expect(task.searchable).toBeTruthy();
    }
  });
});

describe('TASK_INDEX', () => {
  it('is a Map with 20 entries', () => {
    expect(TASK_INDEX).toBeInstanceOf(Map);
    expect(TASK_INDEX.size).toBe(20);
  });

  it('looks up task 15 (Робот)', () => {
    const t = TASK_INDEX.get('15');
    expect(t).toBeDefined();
    expect(t.title.toLowerCase()).toContain('робот');
  });
});

describe('filterTasks', () => {
  it('returns all tasks for empty query', () => {
    expect(filterTasks('')).toHaveLength(20);
  });

  it('finds Робот by keyword', () => {
    const results = filterTasks('робот');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((t) => t.id === '15')).toBe(true);
  });

  it('returns empty array for no-match query', () => {
    expect(filterTasks('xyzнеизвестно')).toHaveLength(0);
  });

  it('is case-insensitive', () => {
    const lower = filterTasks('логика');
    const upper = filterTasks('ЛОГИКА');
    expect(lower.length).toBe(upper.length);
    expect(lower.length).toBeGreaterThan(0);
  });
});
