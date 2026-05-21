<script>
  import { progress } from '../stores/progressStore.js';
  import { chat } from '../stores/chatStore.js';
  import { getTelegramTheme } from '../util/telegram.js';
  import VKPanel from './VKPanel.svelte';
  import VKButton from './VKButton.svelte';

  const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://oge-backend.onrender.com';

  let savedTheme = typeof localStorage !== 'undefined' ? (localStorage.getItem('oge-theme') || 'auto') : 'auto';
  let progressResetDone = false;
  let chatClearDone = false;

  function applyTheme(t) {
    savedTheme = t;
    if (typeof localStorage !== 'undefined') localStorage.setItem('oge-theme', t);
    const effective = t === 'auto' ? (getTelegramTheme().colorScheme || 'light') : t;
    document.body.dataset.theme = effective;
  }

  function resetProgress() {
    progress.reset();
    progressResetDone = true;
    setTimeout(() => { progressResetDone = false; }, 2000);
  }

  function clearChat() {
    chat.clear();
    chatClearDone = true;
    setTimeout(() => { chatClearDone = false; }, 2000);
  }
</script>

<VKPanel>
  <svelte:fragment slot="header">Настройки</svelte:fragment>

  <div style="display: flex; flex-direction: column; gap: 14px;">

    <div>
      <p class="vk-section-label" style="margin-bottom: 6px;">Тема оформления</p>
      <div style="display: flex; gap: 6px;">
        {#each [['auto', 'Авто'], ['light', 'Светлая'], ['dark', 'Тёмная']] as [val, label]}
          <button
            class="vk-task-chip"
            class:is-selected={savedTheme === val}
            style={savedTheme === val ? 'background: var(--vk-row-h); border-color: var(--vk-header); color: var(--vk-link); font-weight: 700;' : ''}
            on:click={() => applyTheme(val)}
          >{label}</button>
        {/each}
      </div>
      <p class="vk-row-sub" style="margin-top: 4px; font-size: 11px;">«Авто» — следует за темой Telegram.</p>
    </div>

    <hr style="border: none; border-top: 1px solid var(--vk-border);" />

    <div>
      <p class="vk-section-label" style="margin-bottom: 6px;">Прогресс</p>
      <VKButton variant="secondary" on:click={resetProgress}>
        {progressResetDone ? 'Сброшено ✓' : 'Сбросить прогресс'}
      </VKButton>
      <p class="vk-row-sub" style="margin-top: 4px; font-size: 11px;">Удаляет статистику попыток по всем заданиям.</p>
    </div>

    <div>
      <p class="vk-section-label" style="margin-bottom: 6px;">История чата</p>
      <VKButton variant="secondary" on:click={clearChat}>
        {chatClearDone ? 'Очищено ✓' : 'Очистить историю чата'}
      </VKButton>
      <p class="vk-row-sub" style="margin-top: 4px; font-size: 11px;">Удаляет все сообщения из раздела «Сообщения».</p>
    </div>

    <hr style="border: none; border-top: 1px solid var(--vk-border);" />

    <div>
      <p class="vk-section-label" style="margin-bottom: 4px;">Сервер</p>
      <code style="font-size: 11px; color: var(--vk-muted); word-break: break-all;">{BACKEND_URL}</code>
    </div>

  </div>
</VKPanel>
