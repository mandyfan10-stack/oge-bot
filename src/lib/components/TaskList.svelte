<script>
  import { currentTask } from '../stores/taskStore.js';
  import { currentSection } from '../stores/uiStore.js';
  import { TASK_LIST, filterTasks } from '../tasks/taskMetadata.js';
  import { progress, progressStats } from '../stores/progressStore.js';
  import VKPanel from './VKPanel.svelte';

  let query = '';
  /** @type {'all' | 'solved' | 'unsolved'} */
  let statusFilter = 'all';

  const FILTERS = [
    ['all', 'Все'],
    ['unsolved', 'Нерешённые'],
    ['solved', 'Решённые'],
  ];

  $: visibleTasks = filterTasks(query).filter((t) => {
    if (statusFilter === 'all') return true;
    const solved = Boolean($progress[t.id]?.correct);
    return statusFilter === 'solved' ? solved : !solved;
  });

  function openTask(id) {
    currentTask.set(id);
    currentSection.set('practice');
  }
</script>

<VKPanel title="Задания">
  <svelte:fragment slot="actions">
    <span class="vk-row-sub">Решено {$progressStats.solved} из {TASK_LIST.length}</span>
  </svelte:fragment>

  <div style="margin-bottom: 8px;">
    <input
      class="vk-input"
      type="search"
      placeholder="Поиск задания…"
      bind:value={query}
      maxlength="50"
      aria-label="Поиск задания"
    />
  </div>

  <div style="display: flex; gap: 6px; margin-bottom: 8px;">
    {#each FILTERS as [val, label]}
      <button
        class="vk-task-chip"
        class:is-selected={statusFilter === val}
        style={statusFilter === val ? 'background: var(--vk-row-h); border-color: var(--vk-header); color: var(--vk-link); font-weight: 700;' : ''}
        on:click={() => (statusFilter = val)}
      >{label}</button>
    {/each}
  </div>

  {#if visibleTasks.length === 0}
    <p class="vk-chat-empty">Ничего не найдено</p>
  {:else}
    <div>
      {#each visibleTasks as task (task.id)}
        <div
          role="button"
          tabindex="0"
          class="vk-row"
          class:is-active={$currentTask === task.id}
          on:click={() => openTask(task.id)}
          on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && openTask(task.id)}
        >
          <span class="vk-avatar">{task.number}</span>
          <div style="min-width: 0; flex: 1;">
            <div class="vk-row-title">Задание {task.number}. {task.title}</div>
            <div class="vk-row-sub">
              {task.topic}{#if $progress[task.id]?.attempts > 0}&nbsp;· попыток: {$progress[task.id].attempts}{/if}
            </div>
          </div>
          {#if $progress[task.id]?.correct}
            <span class="vk-solved-badge">✓</span>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  <div class="vk-section-label" style="margin-top: 8px;">
    Показано {visibleTasks.length} из {TASK_LIST.length}
  </div>
</VKPanel>

<style>
.vk-solved-badge {
  color: #4caf50;
  font-weight: bold;
  font-size: 13px;
  margin-left: 6px;
  flex-shrink: 0;
}
</style>
