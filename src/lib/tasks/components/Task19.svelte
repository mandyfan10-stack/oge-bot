<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { getRandomInt, shuffleArray } from '../utils.js';

  let vars = null;
  let pieces = [];
  let assembled = "";

  onMount(() => {
    const p = [getRandomInt(10, 200), getRandomInt(10, 200), getRandomInt(10, 200), getRandomInt(10, 200)];
    vars = { p, full: p.join('.') };
    pieces = shuffleArray([p[0]+'.', p[1].toString(), '.'+p[2], '.'+p[3]]);
    taskVariables.set(vars);
    correctAnswer.set(vars.full);
  });

  function addPiece(p) {
    assembled += p;
  }

  export function check() {
    return assembled === vars.full;
  }
</script>

{#if vars}
<div class="space-y-6 animate-fade">
  <h3 class="font-medium text-zinc-800 text-lg">Задание 19: IP-адреса</h3>
  <p class="text-sm text-zinc-500 font-light">Соберите адрес: <span class="font-mono text-indigo-600 font-bold">{vars.full}</span></p>
  <div class="p-4 bg-slate-100 rounded-xl font-mono text-center text-lg">{assembled || '...'}</div>
  <div class="flex gap-2 justify-center">
    {#each pieces as b}
      <button on:click={() => addPiece(b)} class="px-3 py-2 border rounded bg-white text-sm hover:bg-slate-50">{b}</button>
    {/each}
  </div>
</div>
{/if}