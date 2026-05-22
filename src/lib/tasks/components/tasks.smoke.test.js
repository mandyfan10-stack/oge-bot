import { describe, it, expect, vi } from 'vitest';
import { get } from 'svelte/store';
import { tick } from 'svelte';

// Telegram util is loaded via taskStore.js → util/telegram.js; mock it for headless tests.
vi.mock('../../util/telegram.js', () => ({
  getUserId: () => null,
  getInitData: () => '',
  hapticSuccess: () => {},
  hapticError: () => {},
  getTelegramTheme: () => ({ colorScheme: 'light', themeParams: {} }),
  onThemeChanged: () => () => {},
  initTelegram: () => {},
}));

const localStorageStub = (() => {
  const store = {};
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  };
})();
vi.stubGlobal('localStorage', localStorageStub);

const { correctAnswer, chatContextVars, taskVariables } = await import('../../stores/taskStore.js');
const { TASK_LIST } = await import('../taskMetadata.js');

const modules = import.meta.glob('./Task*.svelte');

// Tasks whose `check()` reads runtime UI state (contenteditable, robot run,
// chip buttons) rather than the `userInput` arg — these cannot be smoke-tested
// headlessly. We still mount them to verify they don't throw.
const UI_DRIVEN = new Set(['7', '13', '15', '19', '20']);

const ITERATIONS = 5;

// Svelte 4 lifecycle: onMount fires on a microtask after `new Component()`.
// tick() alone is not enough — drain the macrotask queue too.
const flush = () => new Promise((r) => setTimeout(r, 0));

function mount(ComponentClass) {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const component = new ComponentClass({ target });
  return { component, target };
}

describe('task generators self-consistency', () => {
  for (const meta of TASK_LIST) {
    const path = `./Task${meta.id}.svelte`;

    it(`Task${meta.id} (${meta.title}) — answer passes check()`, async () => {
      const loader = modules[path];
      expect(loader, `module ${path} should exist`).toBeTruthy();
      const mod = await loader();
      const ComponentClass = mod.default;

      if (UI_DRIVEN.has(meta.id)) {
        const { component, target } = mount(ComponentClass);
        await tick();
        await flush();
        expect(get(taskVariables), `Task${meta.id} taskVariables not set after mount`).toBeTruthy();
        component.$destroy();
        target.remove();
        return;
      }

      for (let i = 0; i < ITERATIONS; i++) {
        const { component, target } = mount(ComponentClass);
        await tick();
        await flush();
        const ans = get(correctAnswer);
        expect(ans, `Task${meta.id} iter#${i}: correctAnswer was not set`).not.toBeNull();
        expect(typeof component.check, `Task${meta.id} must export check()`).toBe('function');
        const ok = component.check(String(ans));
        expect(ok, `Task${meta.id} iter#${i}: check(${String(ans)}) returned false`).toBe(true);
        component.$destroy();
        target.remove();
      }
    });
  }

  it('chatContextVars never contains the correct answer value after mount', async () => {
    // Tasks where the answer IS the visible prompt (URL/IP/literal value
    // shown to the user) — the chat may legitimately see it.
    const ANSWER_IS_VISIBLE = new Set(['7', '16', '19']);
    for (const meta of TASK_LIST) {
      if (ANSWER_IS_VISIBLE.has(meta.id)) continue;
      const loader = modules[`./Task${meta.id}.svelte`];
      const mod = await loader();
      const { component, target } = mount(mod.default);
      await tick();
      await flush();
      const chat = get(chatContextVars);
      const ans = get(correctAnswer);
      // Sentinel answers like "formatted"/"Robot Done" mean the check
      // is UI-state-driven; the actual answer isn't a single value.
      if (typeof ans === 'string' && /^[A-Z][a-zA-Z ]*$/.test(ans) === false && ans.length > 0) {
        const ansStr = String(ans);
        const leaked = Object.entries(chat).filter(([, v]) => String(v) === ansStr);
        expect(
          leaked,
          `Task${meta.id}: chatContextVars contains the answer value "${ansStr}" under keys ${JSON.stringify(leaked.map(([k]) => k))}`,
        ).toEqual([]);
      }
      component.$destroy();
      target.remove();
    }
  });
});
