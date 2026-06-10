import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { progress, progressStats } from './progressStore.js';

describe('progressStore', () => {
  beforeEach(() => {
    progress.reset();
  });

  it('records attempts and solved flag', () => {
    progress.recordAttempt('1', false);
    progress.recordAttempt('1', true);
    const entry = progress.getProgress('1');
    expect(entry.attempts).toBe(2);
    expect(entry.correctCount).toBe(1);
    expect(entry.correct).toBe(true);
    expect(entry.lastTs).toBeGreaterThan(0);
  });

  it('solved flag is sticky after a later wrong attempt', () => {
    progress.recordAttempt('2', true);
    progress.recordAttempt('2', false);
    expect(progress.getProgress('2').correct).toBe(true);
  });

  it('returns empty entry for unknown task', () => {
    expect(progress.getProgress('99')).toEqual({
      attempts: 0,
      correctCount: 0,
      correct: false,
      lastTs: 0,
    });
  });

  it('aggregates stats across tasks', () => {
    progress.recordAttempt('1', true);
    progress.recordAttempt('2', false);
    progress.recordAttempt('2', false);
    progress.recordAttempt('3', true);
    const stats = get(progressStats);
    expect(stats.solved).toBe(2);
    expect(stats.attempted).toBe(3);
    expect(stats.totalAttempts).toBe(4);
    expect(stats.totalCorrect).toBe(2);
    expect(stats.accuracy).toBe(50);
    expect(stats.lastTs).toBeGreaterThan(0);
  });

  it('accuracy is null with no attempts', () => {
    expect(get(progressStats).accuracy).toBeNull();
  });

  it('reset clears everything', () => {
    progress.recordAttempt('5', true);
    progress.reset();
    expect(get(progressStats).totalAttempts).toBe(0);
    expect(progress.getProgress('5').attempts).toBe(0);
  });
});
