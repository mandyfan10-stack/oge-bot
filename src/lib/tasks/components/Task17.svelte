<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { getRandomInt } from '../utils.js';

  let vars = null;

  onMount(() => {
    const arr = Array.from({length: 5}, () => getRandomInt(10, 99));
    const idx = getRandomInt(0, 4);
    vars = { arr, index: idx, target: arr[idx] };
    taskVariables.set(vars);
    correctAnswer.set(arr[idx]);
  });

  export function check(answer) {
    return parseInt(answer) === vars.target;
  }
</script>

{#if vars}
<div class="space-y-6 animate-fade">
  <h3 class="font-medium text-zinc-800 text-lg">Задание 17: Списки</h3>
  <div class="bg-slate-800 p-5 rounded-2xl text-emerald-400 font-mono text-sm">
    <code>arr = [{vars.arr.join(', ')}]<br>print(arr[{vars.index}])</code>
  </div>
  <p class="text-sm text-zinc-500 font-light">Что выведет программа?</p>
</div>
{/if}