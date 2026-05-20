<script>
  import { currentSection } from '../stores/uiStore.js';

  const items = [
    { id: 'profile',  label: 'Моя страница' },
    { id: 'tasks',    label: 'Задания' },
    { id: 'messages', label: 'Сообщения' },
  ];
</script>

<nav class="vk-sidebar" aria-label="Главное меню">
  {#each items as item}
    <button
      type="button"
      class="vk-nav-item"
      class:is-active={$currentSection === item.id}
      on:click={() => currentSection.set(item.id)}
    >
      {item.label}
    </button>
  {/each}
</nav>
