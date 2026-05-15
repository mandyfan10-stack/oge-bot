<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { getRandomInt, getRandomElement, shuffleArray } from '../utils.js';

  let vars = null;

  onMount(() => {
    const words = [['Коты', 'Собаки'], ['Розы', 'Тюльпаны'], ['Чай', 'Кофе']]; const pair = getRandomElement(words);
    const A = getRandomInt(200, 599); const B = getRandomInt(200, 599); const Inter = Math.floor(Math.random() * 100) + 10; const Union = A + B - Inter;
    const types = [ { q: `${pair[0]} | ${pair[1]}`, ans: Union, table: [[pair[0], A], [pair[1], B], [`${pair[0]} & ${pair[1]}`, Inter]] }, { q: `${pair[0]} & ${pair[1]}`, ans: Inter, table: [[pair[0], A], [pair[1], B], [`${pair[0]} | ${pair[1]}`, Union]] } ];
    const sel = getRandomElement(types);
    vars = { q: sel.q, ans: sel.ans, table: shuffleArray(sel.table) };
    taskVariables.set(vars);
    correctAnswer.set(sel.ans);
  });

  export function check(answer) {
    return parseInt(answer) === vars.ans;
  }
</script>

{#if vars}
<div class="space-y-6 animate-fade">
  <h3 class="font-medium text-zinc-800 text-lg">Задание 8: Множества</h3>
  <p class="text-sm text-zinc-500 font-light">Определи количество страниц (в тыс.) по запросу <b>{vars.q}</b>.</p>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
    <table class="w-full text-sm text-left border-collapse">
      <thead class="bg-slate-50 border-b border-slate-200">
        <tr><th class="p-3 font-medium border border-slate-200">Запрос</th><th class="p-3 font-medium text-right border border-slate-200">Найдено</th></tr>
      </thead>
      <tbody class="text-slate-700">
        {#each vars.table as row}
          <tr><td class="p-3 border border-slate-200">{row[0]}</td><td class="p-3 text-right border border-slate-200 font-mono">{row[1]}</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
{/if}