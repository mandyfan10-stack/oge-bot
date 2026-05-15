<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { getRandomInt } from '../utils.js';

  let vars = null;

  onMount(() => {
    const start = getRandomInt(0, 5); const stop = getRandomInt(10, 20);
    vars = { start, stop };
    taskVariables.set(vars);
    correctAnswer.set(stop - 1);
  });

  export function check(answer) {
    return parseInt(answer) === vars.stop - 1;
  }
</script>

{#if vars}
<div class="space-y-6 animate-fade">
  <h3 class="font-medium text-zinc-800 text-lg">Задание 16: Цикл FOR</h3>
  <div class="bg-slate-800 p-5 rounded-2xl text-emerald-400 font-mono text-sm shadow-xl">
    <code>for i in range({vars.start}, {vars.stop}):<br>&nbsp;&nbsp;print(i)</code>
  </div>
  <p class="text-sm text-zinc-500 font-light">Какое <b>последнее</b> число выведет программа?</p>
</div>
{/if}