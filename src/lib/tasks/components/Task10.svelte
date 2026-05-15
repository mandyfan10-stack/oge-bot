<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { getRandomInt, getRandomBool } from '../utils.js';

  let vars = null;

  onMount(() => {
    const val1 = getRandomInt(20, 59); const val2 = getRandomInt(20, 59); const val3 = getRandomInt(20, 59);
    const findMax = getRandomBool(); const target = findMax ? Math.max(val1, val2, val3) : Math.min(val1, val2, val3);
    vars = { typeStr: findMax ? 'максимальное' : 'минимальное', target, n1: val1.toString(16).toUpperCase(), n2: val2.toString(8), n3: val3.toString(2) };
    taskVariables.set(vars);
    correctAnswer.set(target);
  });

  export function check(answer) {
    return parseInt(answer) === vars.target;
  }
</script>

{#if vars}
<div class="space-y-6 animate-fade">
  <h3 class="font-medium text-zinc-800 text-lg">Задание 10: Системы счисления</h3>
  <p class="text-sm text-zinc-500 font-light">Найдите <b>{vars.typeStr}</b> число и запишите его в десятичной системе.</p>
  <div class="flex items-center justify-around p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xl text-indigo-700 font-mono font-bold tracking-widest shadow-sm">
    <span>{vars.n1}<sub>16</sub></span> <span class="text-slate-300">|</span> <span>{vars.n2}<sub>8</sub></span> <span class="text-slate-300">|</span> <span>{vars.n3}<sub>2</sub></span>
  </div>
</div>
{/if}