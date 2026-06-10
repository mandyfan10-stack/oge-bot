<script>
  import { currentTask } from '../stores/taskStore.js';
  import { currentSection } from '../stores/uiStore.js';
  import { progress, progressStats } from '../stores/progressStore.js';
  import { TASK_LIST, TASK_INDEX } from '../tasks/taskMetadata.js';
  import VKPanel from './VKPanel.svelte';
  import VKButton from './VKButton.svelte';

  $: stats = $progressStats;
  $: total = TASK_LIST.length;
  $: percent = Math.round((stats.solved / total) * 100);
  $: lastMeta = $currentTask ? TASK_INDEX.get($currentTask) : null;

  // Topic breakdown: [{ topic, solved, total }] in catalogue order.
  $: topicRows = (() => {
    /** @type {Map<string, {topic: string, solved: number, total: number}>} */
    const byTopic = new Map();
    for (const task of TASK_LIST) {
      const row = byTopic.get(task.topic) ?? { topic: task.topic, solved: 0, total: 0 };
      row.total += 1;
      if ($progress[task.id]?.correct) row.solved += 1;
      byTopic.set(task.topic, row);
    }
    return [...byTopic.values()];
  })();

  $: unsolved = TASK_LIST.filter((t) => !$progress[t.id]?.correct);

  function openPractice(id) {
    if (id) currentTask.set(id);
    currentSection.set('practice');
  }
</script>

<VKPanel title="Моя страница">
  <div class="hero">
    <div class="hero-top">
      <span class="hero-count">{stats.solved} <span class="hero-total">/ {total}</span></span>
      <span class="hero-label">заданий решено</span>
    </div>
    <div class="bar" role="progressbar" aria-valuenow={stats.solved} aria-valuemin="0" aria-valuemax={total}>
      <div class="bar-fill" style="width: {percent}%;"></div>
    </div>
  </div>

  <div class="stat-grid">
    <div class="stat">
      <span class="stat-value">{stats.totalAttempts}</span>
      <span class="stat-label">попыток</span>
    </div>
    <div class="stat">
      <span class="stat-value">{stats.accuracy === null ? '—' : stats.accuracy + '%'}</span>
      <span class="stat-label">точность</span>
    </div>
    <div class="stat">
      <span class="stat-value">{stats.attempted}</span>
      <span class="stat-label">заданий начато</span>
    </div>
  </div>

  <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
    <VKButton on:click={() => openPractice(null)}>
      {lastMeta ? `Продолжить: задание ${lastMeta.number}` : 'Начать практику'}
    </VKButton>
    <VKButton variant="secondary" on:click={() => currentSection.set('tasks')}>Все задания</VKButton>
  </div>

  <hr style="border: none; border-top: 1px solid var(--vk-border); margin: 14px 0;" />

  <p class="vk-section-label" style="margin-bottom: 6px;">Прогресс по темам</p>
  {#each topicRows as row (row.topic)}
    <div class="topic-row">
      <span class="topic-name">{row.topic}</span>
      <div class="bar bar-small">
        <div class="bar-fill" class:is-done={row.solved === row.total} style="width: {Math.round((row.solved / row.total) * 100)}%;"></div>
      </div>
      <span class="topic-count">{row.solved}/{row.total}</span>
    </div>
  {/each}

  {#if unsolved.length > 0 && unsolved.length < total}
    <p class="vk-section-label" style="margin: 12px 0 6px;">Осталось решить</p>
    <div class="vk-task-chips" style="display: flex; flex-wrap: wrap; gap: 6px;">
      {#each unsolved as task (task.id)}
        <button class="vk-task-chip" on:click={() => openPractice(task.id)} title={task.title}>
          {task.number}
        </button>
      {/each}
    </div>
  {:else if unsolved.length === 0}
    <p class="all-done">🎉 Все 20 заданий решены — отличная подготовка к экзамену!</p>
  {/if}
</VKPanel>

<style>
.hero { padding: 4px 0 10px; }
.hero-top { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
.hero-count { font-size: 28px; font-weight: 700; color: var(--vk-link); line-height: 1; }
.hero-total { font-size: 16px; font-weight: 400; color: var(--vk-muted); }
.hero-label { font-size: 13px; color: var(--vk-muted); }

.bar {
  height: 8px;
  border-radius: 4px;
  background: var(--vk-row-h);
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 4px;
  background: var(--vk-header);
  transition: width 0.4s ease;
}
.bar-fill.is-done { background: var(--vk-success, #4caf50); }

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 4px;
}
.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  background: var(--vk-bg);
  border-radius: 8px;
}
.stat-value { font-size: 18px; font-weight: 700; }
.stat-label { font-size: 11px; color: var(--vk-muted); margin-top: 2px; }

.topic-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
}
.topic-name { flex: 0 0 110px; color: var(--vk-text, inherit); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bar-small { flex: 1; height: 6px; }
.topic-count { flex: 0 0 32px; text-align: right; color: var(--vk-muted); font-variant-numeric: tabular-nums; }

.all-done {
  margin-top: 12px;
  font-size: 13px;
  color: var(--vk-success, #4caf50);
  font-weight: 600;
}
</style>
