<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { getRandomElement, shuffleArray } from '../utils.js';

  let vars = null;
  let pieces = [];
  let assembled = "";
  let disabledButtons = new Set();

  onMount(() => {
    const protocols = ['http', 'https', 'ftp']; const domains = ['edu.ru', 'exam.net', 'test.org', 'school.com']; const files = ['index.htm', 'doc.pdf', 'image.jpg', 'archive.zip'];
    const p = getRandomElement(protocols); const d = getRandomElement(domains); const f = getRandomElement(files);
    const full = `${p}://${d}/${f}`;
    vars = { parts: [p, d, f], full };
    pieces = shuffleArray(['://', '/', vars.parts[2], vars.parts[0], vars.parts[1]]);
    taskVariables.set(vars);
    correctAnswer.set(full);
  });

  function addPiece(p, index) {
      assembled += p;
      disabledButtons.add(index);
      disabledButtons = disabledButtons; // trigger reactivity
  }

  function reset() {
      assembled = "";
      disabledButtons = new Set();
  }

  export function check() {
      return assembled === vars.full;
  }
</script>

{#if vars}
<div class="space-y-6 animate-fade">
  <h3 class="font-medium text-zinc-800 text-lg">Задание 7: Сборка URL</h3>
  <p class="text-sm text-zinc-500 font-light">Собери адрес: <span class="font-mono text-xs text-indigo-600 font-bold">{vars.full}</span></p>
  <div class="min-h-[50px] bg-slate-100 border border-slate-200 p-4 rounded-xl font-mono text-slate-800 break-all text-center">{assembled || '...'}</div>
  <div class="flex flex-wrap gap-2 justify-center">
    {#each pieces as p, i}
      <button 
        on:click={() => addPiece(p, i)} 
        disabled={disabledButtons.has(i)}
        class="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
        {p}
      </button>
    {/each}
    <button on:click={reset} class="px-3 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-sm">Сброс</button>
  </div>
</div>
{/if}