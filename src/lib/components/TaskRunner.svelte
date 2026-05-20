<script>
  import { tick, afterUpdate } from 'svelte';
  import { currentTask } from '../stores/taskStore.js';
  import { TASK_INDEX } from '../tasks/taskMetadata.js';
  import { hapticSuccess, hapticError } from '../util/telegram.js';
  import VKPanel from './VKPanel.svelte';
  import VKButton from './VKButton.svelte';

  const taskModules = import.meta.glob('../tasks/components/Task*.svelte');

  let TaskComponent = null;
  let loadError = '';
  let userInput = '';
  let feedback = { message: '', type: '' };
  let taskComponentRef;

  $: loadTaskComponent($currentTask);
  $: meta = $currentTask ? TASK_INDEX.get($currentTask) : null;

  async function loadTaskComponent(id) {
    if (!id) return;
    loadError = '';
    userInput = '';
    feedback = { message: '', type: '' };
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
        bind:value={userInput}
        placeholder="Введите ответ"
        maxlength="200"
        on:keydown={(e) => e.key === 'Enter' && checkAnswer()}
      />
    </div>

    <div style="margin-top: 10px; display: flex; gap: 8px; align-items: center;">
      <VKButton on:click={checkAnswer}>Проверить</VKButton>
      {#if feedback.message}
        <span
          class="vk-feedback"
          class:is-success={feedback.type === 'success'}
          class:is-error={feedback.type === 'error'}
        >
          {feedback.message}
        </span>
      {/if}
    </div>
  {:else}
    <p class="vk-row-sub">Загрузка задания…</p>
  {/if}
</VKPanel>
