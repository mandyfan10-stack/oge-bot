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

  it('recent skips empty assistant placeholder', () => {
    chat.pushUser('hi');
    chat.startAssistant(); // empty content
    const recent = chat.recent(15);
    expect(recent).toHaveLength(1);
    expect(recent[0].role).toBe('user');
  });

  it('recent skips whitespace-only messages', () => {
    chat.pushUser('   ');
    chat.pushUser('real');
    const recent = chat.recent(15);
    expect(recent).toHaveLength(1);
    expect(recent[0].content).toBe('real');
  });

  it('persist drops trailing empty assistant placeholder', async () => {
    chat.pushUser('hi');
    chat.startAssistant();
    // wait one microtask for the subscribe → persist to flush
    await new Promise((r) => setTimeout(r, 0));
    const persisted = JSON.parse(localStorage.getItem('oge-bot:chat-history:v1'));
    expect(persisted).toHaveLength(1);
    expect(persisted[0].role).toBe('user');
  });
});

// loadInitial is exercised via a fresh module import — verify that empty
// messages in localStorage are filtered out on cold start.
describe('chatStore.loadInitial', () => {
  it('filters out empty-content messages restored from localStorage', async () => {
    // seed localStorage with a poisoned history from a previous interrupted stream
    localStorage.setItem(
      'oge-bot:chat-history:v1',
      JSON.stringify([
        { role: 'user', content: 'ку', ts: 1 },
        { role: 'assistant', content: '', ts: 2 },
        { role: 'assistant', content: '   ', ts: 3 },
        { role: 'user', content: 'ещё', ts: 4 },
      ])
    );
    vi.resetModules();
    const { chat: freshChat } = await import('./chatStore.js');
    const messages = get(freshChat);
    expect(messages).toHaveLength(2);
    expect(messages.every((m) => m.content.trim().length > 0)).toBe(true);
  });
});
