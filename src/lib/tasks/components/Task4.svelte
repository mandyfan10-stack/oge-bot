<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { getRandomInt } from '../utils.js';

  let vars = null;

  onMount(() => {
    const w = { AB: getRandomInt(1, 6), AC: getRandomInt(3, 10), BC: getRandomInt(1, 5), BD: getRandomInt(2, 8), CD: getRandomInt(1, 4), CE: getRandomInt(3, 9), DE: getRandomInt(1, 6) };
    const graph = { A: {B:w.AB, C:w.AC}, B: {A:w.AB, C:w.BC, D:w.BD}, C: {A:w.AC, B:w.BC, D:w.CD, E:w.CE}, D: {B:w.BD, C:w.CD, E:w.DE}, E: {C:w.CE, D:w.DE} };
    let minLen = Infinity;
    function dfs(node, len, visited) {
       if(node === 'E') { minLen = Math.min(minLen, len); return; }
       for(let n in graph[node]) { if(!visited.includes(n)) dfs(n, len + graph[node][n], [...visited, n]); }
    }
    dfs('A', 0, ['A']);
    vars = { w, minLen };
    taskVariables.set(vars);
    correctAnswer.set(minLen);
  });

  export function check(answer) {
    return parseInt(answer) === vars.minLen;
  }
</script>

{#if vars}
<div class="space-y-6 animate-fade">
  <h3 class="font-medium text-zinc-800 text-lg">Задание 4: Маршруты</h3>
  <p class="text-sm text-zinc-500 font-light">Определите длину <b>самого короткого</b> пути между пунктами <b>A</b> и <b>E</b>.</p>
  <div class="overflow-x-auto rounded-xl border border-slate-200">
    <table class="w-full text-center text-sm font-mono border-collapse">
      <thead class="bg-slate-50 border-b border-slate-200">
        <tr><th class="p-2 border border-slate-200"></th><th class="p-2 border border-slate-200">A</th><th class="p-2 border border-slate-200">B</th><th class="p-2 border border-slate-200">C</th><th class="p-2 border border-slate-200">D</th><th class="p-2 border border-slate-200">E</th></tr>
      </thead>
      <tbody class="text-slate-700">
        <tr><th class="p-2 bg-slate-50 border border-slate-200">A</th><td class="p-2 border border-slate-200">-</td><td class="p-2 border border-slate-200">{vars.w.AB}</td><td class="p-2 border border-slate-200">{vars.w.AC}</td><td class="p-2 border border-slate-200">-</td><td class="p-2 border border-slate-200">-</td></tr>
        <tr><th class="p-2 bg-slate-50 border border-slate-200">B</th><td class="p-2 border border-slate-200">{vars.w.AB}</td><td class="p-2 border border-slate-200">-</td><td class="p-2 border border-slate-200">{vars.w.BC}</td><td class="p-2 border border-slate-200">{vars.w.BD}</td><td class="p-2 border border-slate-200">-</td></tr>
        <tr><th class="p-2 bg-slate-50 border border-slate-200">C</th><td class="p-2 border border-slate-200">{vars.w.AC}</td><td class="p-2 border border-slate-200">{vars.w.BC}</td><td class="p-2 border border-slate-200">-</td><td class="p-2 border border-slate-200">{vars.w.CD}</td><td class="p-2 border border-slate-200">{vars.w.CE}</td></tr>
        <tr><th class="p-2 bg-slate-50 border border-slate-200">D</th><td class="p-2 border border-slate-200">-</td><td class="p-2 border border-slate-200">{vars.w.BD}</td><td class="p-2 border border-slate-200">{vars.w.CD}</td><td class="p-2 border border-slate-200">-</td><td class="p-2 border border-slate-200">{vars.w.DE}</td></tr>
        <tr><th class="p-2 bg-slate-50 border border-slate-200">E</th><td class="p-2 border border-slate-200">-</td><td class="p-2 border border-slate-200">-</td><td class="p-2 border border-slate-200">{vars.w.CE}</td><td class="p-2 border border-slate-200">{vars.w.DE}</td><td class="p-2 border border-slate-200">-</td></tr>
      </tbody>
    </table>
  </div>
</div>
{/if}