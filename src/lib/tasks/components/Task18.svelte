<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { getRandomInt } from '../utils.js';

  let vars = null;

  onMount(() => {
    const a = getRandomInt(2, 5); const b = getRandomInt(1, 10); const x = getRandomInt(2, 6);
    vars = { a, b, x, ans: x * a + b };
    taskVariables.set(vars);
    correctAnswer.set(vars.ans);
  });

  export function check(answer) {
    return parseInt(answer) === vars.ans;
  }
</script>

{#if vars}
<div class="space-y-6 animate-fade">
  <h3 class="font-medium text-zinc-800 text-lg">Задание 18: Функции</h3>
  <div class="bg-slate-800 p-5 rounded-2xl text-emerald-400 font-mono text-sm">
    <code>def f(x): return x * {vars.a} + {vars.b}<br>print(f({vars.x}))</code>
  </div>
  <p class="text-sm text-zinc-500 font-light">Что выведет программа?</p>
</div>
{/if}