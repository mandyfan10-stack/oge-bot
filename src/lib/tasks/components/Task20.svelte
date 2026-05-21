<script>
  import { setupTask } from '../taskSetup.js';
  import { shuffleArray } from '../utils.js';

  let options = [];
  let selectedAnswer = null;
  let correctAns = '';

  const vars = setupTask(() => {
    const q = { q: 'Мозг компьютера (вычисления)', a: 'Процессор' };
    correctAns = q.a;
    options = shuffleArray(['Процессор', 'ОЗУ', 'Блок питания', 'Кулер']);
    selectedAnswer = null;
    return {
      vars: q,
      answer: q.a,
      solution: `Центральный процессор (ЦП) — основной вычислительный компонент. Ответ: <b>${q.a}</b>.`,
    };
  });

  export function check() {
    return selectedAnswer === correctAns;
  }
</script>

{#if $vars}
<div>
  <p class="vk-row-sub" style="margin-bottom: 8px;">Какое устройство отвечает за: <b>{$vars.q}</b>?</p>
  <div class="vk-task-options">
    {#each options as opt}
      <button
        class="vk-task-option"
        class:is-selected={selectedAnswer === opt}
        on:click={() => selectedAnswer = opt}
      >{opt}</button>
    {/each}
  </div>
</div>
{/if}
