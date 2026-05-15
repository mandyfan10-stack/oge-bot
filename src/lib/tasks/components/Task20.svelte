<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { shuffleArray } from '../utils.js';

  let vars = null;
  let options = [];
  let selectedAnswer = null;

  onMount(() => {
    const q = { q: 'Мозг компьютера (вычисления)', a: 'Процессор' };
    vars = q;
    options = shuffleArray(['Процессор', 'ОЗУ', 'Блок питания', 'Кулер']);
    taskVariables.set(q);
    correctAnswer.set(q.a);
  });

  export function check() {
    return selectedAnswer === vars.a;
  }
</script>

{#if vars}
<div class="space-y-6 animate-fade">
  <h3 class="font-medium text-zinc-800 text-lg">Задание 20: Устройство ПК</h3>
  <p class="text-sm text-zinc-500 font-light">Какое устройство отвечает за: <b>{vars.q}</b>?</p>
  <div class="grid grid-cols-2 gap-2">
    {#each options as opt}
      <button 
        on:click={() => selectedAnswer = opt} 
        class="p-3 border rounded text-xs transition-colors {selectedAnswer === opt ? 'bg-indigo-100 border-indigo-300' : 'bg-white hover:bg-slate-50'}">
        {opt}
      </button>
    {/each}
  </div>
</div>
{/if}