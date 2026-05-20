<script>
  import { currentTask } from '../stores/taskStore.js';
  import { currentSection } from '../stores/uiStore.js';
  import { TASK_LIST, filterTasks } from '../tasks/taskMetadata.js';
  import { progress } from '../stores/progressStore.js';
  import VKPanel from './VKPanel.svelte';

  let query = '';

  $: visibleTasks = filterTasks(query);

  function openTask(id) {
    currentTask.set(id);
    currentSection.set('profile');
  }
</script>

<VKPanel title="Задания">
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
            <div class="vk-row-sub">{task.topic}</div>
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
