<script>
  import { tick } from 'svelte';
  import { currentTask, chatContextVars } from '../stores/taskStore.js';
  import { chat } from '../stores/chatStore.js';
  import { sendChatMessage, ChatError } from '../api/chatClient.js';
  import { renderMarkdown } from '../util/markdown.js';
  import { TASK_INDEX } from '../tasks/taskMetadata.js';
  import VKPanel from './VKPanel.svelte';
  import VKButton from './VKButton.svelte';

  const QUICK_PROMPTS = [
    'Объясни, как решать это задание',
    'Дай подсказку, не раскрывая ответ',
    'Разбери похожий пример',
  ];

  $: taskMeta = $currentTask ? TASK_INDEX.get($currentTask) : null;

  let inputMessage = '';
  let isTyping = false;
  let listEl;
  let inputRef;
  let pendingText = '';
  let lastError = '';

  let lastScrollTime = 0;
  function throttledScroll() {
    const now = Date.now();
    if (now - lastScrollTime > 200) {
      lastScrollTime = now;
      scrollToBottom();
    }
  }

  function buildTaskContext() {
    return `Задание №${$currentTask} | Условие: ${JSON.stringify($chatContextVars)}`;
  }

  function formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  async function scrollToBottom() {
    await tick();
    listEl?.scrollTo({ top: listEl.scrollHeight, behavior: 'smooth' });
  }

  function clearChat() {
    chat.clear();
    inputMessage = '';
    inputRef?.focus();
  }

  async function sendMessage(retryText) {
    const text = (retryText ?? inputMessage).trim();
    if (!text || isTyping) return;

    lastError = '';
    pendingText = text;
    inputMessage = '';

    // Snapshot history BEFORE adding placeholders. `recent` already filters
    // out empty-content messages, so the payload is guaranteed to satisfy
    // the backend's min_length=1 constraint on history items.
    const history = chat.recent(15);
    const taskDescription = buildTaskContext();

    chat.pushUser(text);
    chat.startAssistant();
    isTyping = true;
    scrollToBottom();

    try {
      const stream = sendChatMessage({ text, history, taskDescription });
      let receivedAny = false;
      for await (const chunk of stream) {
        receivedAny = true;
        chat.appendAssistantChunk(chunk);
        throttledScroll();
      }
      if (!receivedAny) {
        chat.setLastAssistant('(пустой ответ от сервера)');
      }
    } catch (err) {
      const msg =
        err instanceof ChatError
          ? err.userMessage
          : err?.message || 'Ошибка связи с сервером.';
      chat.setLastAssistant(msg);
      lastError = msg;
    } finally {
      isTyping = false;
      scrollToBottom();
    }
  }
</script>

<VKPanel title="Сообщения">
  <svelte:fragment slot="actions">
    {#if $chat.length > 0}
      <button class="vk-link-button" on:click={clearChat}>Очистить</button>
    {/if}
  </svelte:fragment>

  <div bind:this={listEl} class="vk-chat-list" style="max-height: 60vh; overflow-y: auto;">
    {#if $chat.length === 0}
      <div class="vk-chat-empty">
        Задайте вопрос ИИ-репетитору
        <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 6px; align-items: center;">
          {#each QUICK_PROMPTS as prompt}
            <button class="vk-task-chip" disabled={isTyping} on:click={() => sendMessage(prompt)}>
              {prompt}
            </button>
          {/each}
        </div>
      </div>
    {:else}
      {#each $chat as msg (msg.ts + ':' + msg.role)}
        <div class="vk-chat-row">
          <span class="vk-avatar" class:is-user={msg.role === 'user'} class:is-mentor={msg.role === 'assistant'}>
            {msg.role === 'user' ? 'Я' : 'ИИ'}
          </span>
          <div class="vk-chat-body">
            <div class="vk-chat-meta">
              <span class="vk-chat-name">{msg.role === 'user' ? 'Вы' : 'ИИ-репетитор'}</span>
              <span class="vk-chat-time">{formatTime(msg.ts)}</span>
            </div>
            {#if msg.role === 'assistant'}
              {#if msg.content}
                <div class="vk-chat-text">{@html renderMarkdown(msg.content)}</div>
              {:else if isTyping}
                <div class="vk-typing" aria-label="печатает">
                  <span class="vk-typing-dot"></span>
                  <span class="vk-typing-dot"></span>
                  <span class="vk-typing-dot"></span>
                </div>
              {/if}
            {:else}
              <div class="vk-chat-text">{msg.content}</div>
            {/if}
          </div>
        </div>
      {/each}
    {/if}
  </div>

  {#if lastError}
    <div style="margin-top: 6px;">
      <VKButton on:click={() => sendMessage(pendingText)}>Повторить</VKButton>
    </div>
  {/if}

  {#if taskMeta}
    <p class="vk-row-sub" style="margin-top: 8px; font-size: 11px;">
      Контекст: задание {taskMeta.number} «{taskMeta.title}» — репетитор видит его условие.
    </p>
  {/if}

  <form on:submit|preventDefault={() => sendMessage()} style="margin-top: 8px; display: flex; gap: 6px;">
    <input
      bind:this={inputRef}
      bind:value={inputMessage}
      class="vk-input"
      type="text"
      placeholder="Введите сообщение…"
      maxlength="2000"
      disabled={isTyping}
      style="flex: 1;"
    />
    <VKButton type="submit" disabled={isTyping || !inputMessage.trim()}>
      Отправить
    </VKButton>
  </form>
</VKPanel>
