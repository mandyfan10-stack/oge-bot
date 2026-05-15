<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { getRandomInt, getRandomElement, getRandomBool } from '../utils.js';

  let vars = null;

  onMount(() => {
    const targetNode = getRandomElement(['G', 'H']); const baseEdges = [['A','B'], ['A','C'], ['B','D'], ['C','D'], ['C','E'], ['D','F'], ['E','F'], ['F','G']];
    const optionalEdges = [['A','D'], ['B','F'], ['E','G'], ['D','G'], ['F','H'], ['G','H']];
    let currentEdges = [...baseEdges]; optionalEdges.forEach(edge => { if (getRandomBool()) currentEdges.push(edge); });
    const specNode = getRandomElement(['B', 'C']); const reqType = getRandomInt(0, 2);
    let qText = ''; if(reqType === 1) qText = `, проходящих через город <b>${specNode}</b>`; if(reqType === 2) qText = `, <b>НЕ</b> проходящих через город <b>${specNode}</b>`;
    let graph = {}; currentEdges.forEach(e => { if(!graph[e[0]]) graph[e[0]] = []; graph[e[0]].push(e[1]); });
    let count = 0; function dfs(u, visited) {
       if (u === targetNode) { if (reqType === 1 && !visited.includes(specNode)) return; if (reqType === 2 && visited.includes(specNode)) return; count++; return; }
       for(let v of graph[u] || []) { if(!visited.includes(v)) dfs(v, [...visited, v]); }
    }
    dfs('A', ['A']);
    vars = { targetNode, edges: currentEdges, qText, answer: count };
    taskVariables.set(vars);
    correctAnswer.set(count);
  });

  export function check(answer) {
    return parseInt(answer) === vars.answer;
  }
</script>

{#if vars}
<div class="space-y-6 animate-fade">
  <h3 class="font-medium text-zinc-800 text-lg">Задание 9: Количество путей</h3>
  <p class="text-sm text-zinc-500 font-light">Сколько существует путей из города <b>A</b> в город <b>{vars.targetNode}</b>{@html vars.qText}?</p>
  <div class="p-4 bg-slate-100 border border-slate-200 rounded-2xl font-mono text-xs text-center text-slate-500">Граф: {vars.edges.map(e => e.join('→')).join(', ')}</div>
</div>
{/if}