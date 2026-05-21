<script>
  import { setupTask } from '../taskSetup.js';
  import { getRandomInt, getRandomElement, getRandomBool } from '../utils.js';

  const vars = setupTask(() => {
    const targetNode = getRandomElement(['G', 'H']);
    const baseEdges = [['A','B'], ['A','C'], ['B','D'], ['C','D'], ['C','E'], ['D','F'], ['E','F'], ['F','G']];
    const optionalEdges = [['A','D'], ['B','F'], ['E','G'], ['D','G'], ['F','H'], ['G','H']];
    let currentEdges = [...baseEdges];
    optionalEdges.forEach(edge => { if (getRandomBool()) currentEdges.push(edge); });
    const specNode = getRandomElement(['B', 'C']);
    const reqType = getRandomInt(0, 2);
    let qText = '';
    if (reqType === 1) qText = `, проходящих через город <b>${specNode}</b>`;
    if (reqType === 2) qText = `, <b>НЕ</b> проходящих через город <b>${specNode}</b>`;
    let graph = {};
    currentEdges.forEach(e => { if (!graph[e[0]]) graph[e[0]] = []; graph[e[0]].push(e[1]); });
    let count = 0;
    function dfs(u, visited) {
      if (u === targetNode) {
        if (reqType === 1 && !visited.includes(specNode)) return;
        if (reqType === 2 && visited.includes(specNode)) return;
        count++; return;
      }
      for (let v of graph[u] || []) { if (!visited.includes(v)) dfs(v, [...visited, v]); }
    }
    dfs('A', ['A']);
    return {
      vars: { targetNode, edges: currentEdges, qText, count },
      answer: String(count),
      solution: `Перебираем все пути из A в ${targetNode}${reqType === 1 ? ` через ${specNode}` : reqType === 2 ? ` без ${specNode}` : ''}. Таких путей: <b>${count}</b>.`,
    };
  });

  export function check(answer) {
    return !!$vars && parseInt(answer) === $vars.count;
  }
</script>

{#if $vars}
<div>
  <p class="vk-row-sub" style="margin-bottom: 8px;">Сколько существует путей из города <b>A</b> в город <b>{$vars.targetNode}</b>{@html $vars.qText}?</p>
  <div class="vk-task-highlight" style="font-size: 11px; word-break: break-all;">Граф: {$vars.edges.map(e => e.join('→')).join(', ')}</div>
</div>
{/if}
