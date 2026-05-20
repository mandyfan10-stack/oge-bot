<script>
  import { onMount } from 'svelte';
  import { currentTask } from './lib/stores/taskStore.js';
  import { currentSection } from './lib/stores/uiStore.js';
  import { initTelegram } from './lib/util/telegram.js';

  import VKHeader from './lib/components/VKHeader.svelte';
  import VKSidebar from './lib/components/VKSidebar.svelte';
  import TaskRunner from './lib/components/TaskRunner.svelte';
  import TaskList from './lib/components/TaskList.svelte';
  import AIChat from './lib/components/AIChat.svelte';

  onMount(() => {
    initTelegram({ headerColor: '#517396', backgroundColor: '#edeef0' });
    if (!$currentTask) currentTask.set('1');
  });
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
