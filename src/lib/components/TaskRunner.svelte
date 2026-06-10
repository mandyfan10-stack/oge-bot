<script>
  import { tick, afterUpdate } from 'svelte';
  import { currentTask, taskSolution } from '../stores/taskStore.js';
  import { currentSection } from '../stores/uiStore.js';
  import { TASK_INDEX, TASK_LIST } from '../tasks/taskMetadata.js';
  import { hapticSuccess, hapticError } from '../util/telegram.js';
  import { progress } from '../stores/progressStore.js';
  import VKPanel from './VKPanel.svelte';
  import VKButton from './VKButton.svelte';

  const taskModules = import.meta.glob('../tasks/components/Task*.svelte');

  let TaskComponent = null;
  let loadError = '';
  let userInput = '';
  let feedback = { message: '', type: '' };
  let taskComponentRef;
  let inputEl;

  $: loadTaskComponent($currentTask);
  $: meta = $currentTask ? TASK_INDEX.get($currentTask) : null;
  $: taskIdx = TASK_LIST.findIndex((t) => t.id === $currentTask);
  $: prevTask = taskIdx > 0 ? TASK_LIST[taskIdx - 1] : null;
  $: nextTask = taskIdx >= 0 && taskIdx < TASK_LIST.length - 1 ? TASK_LIST[taskIdx + 1] : null;

  function goToTask(id) {
    currentTask.set(id);
  }

  function askAI() {
    currentSection.set('messages');
  }

  async function loadTaskComponent(id) {
    if (!id) return;
    loadError = '';
    userInput = '';
    feedback = { message: '', type: '' };
    taskSolution.set('');
    const path = `../tasks/components/Task${id}.svelte`;
    const loader = taskModules[path];
    if (!loader) {
      TaskComponent = null;
      loadError = `Задание ${id} не найдено.`;
      return;
    }
    try {
      const mod = await loader();
      TaskComponent = mod.default;
    } catch (err) {
      console.error('[TaskRunner] failed to load task', id, err);
      TaskComponent = null;
      loadError = `Не удалось загрузить задание ${id}.`;
    }
  }

  afterUpdate(() => {
    // Some task components use lucide icons; re-render after each mount.
    if (typeof window !== 'undefined' && window.lucide?.createIcons) {
      window.lucide.createIcons();
    }
  });

  async function checkAnswer() {
    if (!taskComponentRef || typeof taskComponentRef.check !== 'function') return;
    await tick();
    const ok = taskComponentRef.check(userInput);
    if (ok) {
      feedback = { message: 'Верно', type: 'success' };
      hapticSuccess();
    } else {
      feedback = { message: 'Попробуйте ещё раз', type: 'error' };
      hapticError();
    }
    progress.recordAttempt($currentTask, ok);
    inputEl?.focus();
  }
</script>

<VKPanel>
  <svelte:fragment slot="header">
    {#if meta}
      Задание {meta.number}. {meta.title}
    {:else}
      Моя страница
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="actions">
    {#if meta}
      <span class="vk-row-sub">{meta.topic}</span>
    {/if}
  </svelte:fragment>

  {#if loadError}
    <p class="vk-feedback is-error">{loadError}</p>
  {:else if TaskComponent}
    <div class="task-content">
      <svelte:component this={TaskComponent} bind:this={taskComponentRef} />
    </div>

    <div style="margin-top: 12px;">
      <label class="vk-section-label" for="answer-input">Ваш ответ</label>
      <input
        id="answer-input"
        class="vk-input"
        type="text"
        bind:this={inputEl}
        bind:value={userInput}
        placeholder="Введите ответ"
        maxlength="200"
        on:keydown={(e) => e.key === 'Enter' && checkAnswer()}
      />
    </div>

    <div style="margin-top: 10px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
      <VKButton on:click={checkAnswer}>Проверить</VKButton>
      <VKButton variant="secondary" on:click={() => loadTaskComponent($currentTask)}>Новый вариант</VKButton>
      <VKButton variant="secondary" on:click={askAI}>Спросить ИИ</VKButton>
      {#if feedback.message}
        <span
          class="vk-feedback"
          class:is-success={feedback.type === 'success'}
          class:is-error={feedback.type === 'error'}
        >
          {feedback.message}
        </span>
      {/if}
      {#if $progress[$currentTask]?.attempts > 0}<span class="vk-row-sub">Попыток: {$progress[$currentTask].attempts}</span>{/if}
    </div>

    {#if feedback.type === 'success' && $taskSolution}
      <div style="margin-top: 10px; padding: 8px 12px; background: var(--vk-bg); border-left: 3px solid var(--vk-success); font-size: 12px;">
        <strong class="vk-section-label">Решение:</strong>
        <p class="vk-row-sub" style="margin-top: 4px;">{@html $taskSolution}</p>
      </div>
    {/if}

    {#if feedback.type === 'success' && nextTask}
      <div style="margin-top: 10px;">
        <VKButton on:click={() => goToTask(nextTask.id)}>Следующее задание →</VKButton>
      </div>
    {/if}

    <div style="margin-top: 14px; display: flex; justify-content: space-between; gap: 8px; border-top: 1px solid var(--vk-border); padding-top: 10px;">
      {#if prevTask}
        <button class="vk-link-button" on:click={() => goToTask(prevTask.id)}>← Задание {prevTask.number}</button>
      {:else}
        <span></span>
      {/if}
      {#if nextTask}
        <button class="vk-link-button" on:click={() => goToTask(nextTask.id)}>Задание {nextTask.number} →</button>
      {/if}
    </div>
  {:else}
    <div class="vk-skeleton">
      <div class="vk-skeleton-bar"></div>
      <div class="vk-skeleton-bar"></div>
      <div class="vk-skeleton-bar"></div>
    </div>
  {/if}
</VKPanel>
