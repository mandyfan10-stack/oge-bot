<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { getRandomInt, getRandomElement } from '../utils.js';

  let vars = null;

  onMount(() => {
    const subjects = ['информатика', 'алгебра', 'физика'];
    const data = Array.from({length: 6}, () => ({ sub: getRandomElement(subjects), score: getRandomInt(2, 5), name: 'Ученик' }));
    const targetSub = getRandomElement(subjects);
    let q1Ans = 0; data.forEach(d => { if(d.sub === targetSub) q1Ans++; });
    vars = { data, targetSub, q1Ans };
    taskVariables.set(vars);
    correctAnswer.set(q1Ans);
  });

  export function check(answer) {
    return parseInt(answer) === vars.q1Ans;
  }
</script>

{#if vars}
<div class="space-y-6 animate-fade">
  <h3 class="font-medium text-zinc-800 text-lg">Задание 14: Таблицы</h3>
  <p class="text-sm text-zinc-500 font-light">Сколько учеников любят предмет <b>{vars.targetSub}</b>?</p>
  <div class="rounded-xl border border-slate-200 overflow-hidden bg-white">
    <table class="w-full text-xs font-mono text-center">
      <thead class="bg-slate-50"><tr><th class="p-2 border border-slate-200">Предмет</th><th class="p-2 border border-slate-200">Балл</th></tr></thead>
      <tbody>
        {#each vars.data as r}
          <tr><td class="p-2 border border-slate-200">{r.sub}</td><td class="p-2 border border-slate-200">{r.score}</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
{/if}