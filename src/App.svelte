<script>
  import { onMount, onDestroy } from 'svelte';
  import { currentTask } from './lib/stores/taskStore.js';
  import { currentSection } from './lib/stores/uiStore.js';
  import { initTelegram, getTelegramTheme, onThemeChanged } from './lib/util/telegram.js';

  function applyTheme() {
    const { colorScheme } = getTelegramTheme();
    document.body.dataset.theme = colorScheme;
  }

  import VKHeader from './lib/components/VKHeader.svelte';
  import VKSidebar from './lib/components/VKSidebar.svelte';
  import TaskRunner from './lib/components/TaskRunner.svelte';
  import TaskList from './lib/components/TaskList.svelte';
  import AIChat from './lib/components/AIChat.svelte';

  let offTheme;
  onMount(() => {
    initTelegram({ headerColor: '#517396', backgroundColor: '#edeef0' });
    if (!$currentTask) currentTask.set('1');
    applyTheme();
    offTheme = onThemeChanged(applyTheme);
  });
  onDestroy(() => { if (offTheme) offTheme(); });
</script>

<div class="vk-shell">
  <VKHeader />

  <div class="vk-body">
    <VKSidebar />

    <main>
      {#if $currentSection === 'profile'}
        <TaskRunner />
      {:else if $currentSection === 'tasks'}
        <TaskList />
      {:else if $currentSection === 'messages'}
        <AIChat />
      {/if}
    </main>
  </div>
</div>
