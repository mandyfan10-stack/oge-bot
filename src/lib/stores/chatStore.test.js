import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the telegram util so getUserId() returns null in test env (no localStorage prefix)
vi.mock('../util/telegram.js', () => ({
  getUserId: () => null,
  getInitData: () => '',
}));

// Provide a minimal localStorage stub
const store = {};
vi.stubGlobal('localStorage', {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = v; },
  removeItem: (k) => { delete store[k]; },
});
vi.stubGlobal('requestAnimationFrame', (cb) => setTimeout(cb, 0));

// Import after mocks are set up
const { chat } = await import('./chatStore.js');
import { get } from 'svelte/store';

describe('chatStore', () => {
  beforeEach(() => {
    chat.clear();
  });

  it('starts empty', () => {
    expect(get(chat)).toHaveLength(0);
  });

  it('pushUser adds a user message', () => {
    chat.pushUser('hello');
    const messages = get(chat);
    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe('user');
    expect(messages[0].content).toBe('hello');
  });

  it('startAssistant adds an empty assistant placeholder', () => {
    chat.startAssistant();
    const messages = get(chat);
    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe('assistant');
    expect(messages[0].content).toBe('');
  });

  it('setLastAssistant overwrites the last assistant message', () => {
    chat.startAssistant();
    chat.setLastAssistant('final answer');
    const messages = get(chat);
    expect(messages[0].content).toBe('final answer');
  });

  it('clear resets to empty', () => {
    chat.pushUser('a');
    chat.pushUser('b');
    chat.clear();
    expect(get(chat)).toHaveLength(0);
  });

  it('recent returns at most n messages', () => {
    for (let i = 0; i < 20; i++) chat.pushUser(`msg${i}`);
    const recent = chat.recent(5);
    expect(recent).toHaveLength(5);
    expect(recent[4].content).toBe('msg19');
  });

  it('recent strips ts field', () => {
    chat.pushUser('hi');
    const recent = chat.recent(1);
    expect(recent[0]).not.toHaveProperty('ts');
    expect(recent[0]).toHaveProperty('role');
    expect(recent[0]).toHaveProperty('content');
  });
});
