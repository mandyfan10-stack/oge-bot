<script>
  import { setupTask } from '../taskSetup.js';
  import { getRandomInt } from '../utils.js';

  const vars = setupTask(() => {
    const w = { AB: getRandomInt(1, 6), AC: getRandomInt(3, 10), BC: getRandomInt(1, 5), BD: getRandomInt(2, 8), CD: getRandomInt(1, 4), CE: getRandomInt(3, 9), DE: getRandomInt(1, 6) };
    const graph = { A: {B:w.AB, C:w.AC}, B: {A:w.AB, C:w.BC, D:w.BD}, C: {A:w.AC, B:w.BC, D:w.CD, E:w.CE}, D: {B:w.BD, C:w.CD, E:w.DE}, E: {C:w.CE, D:w.DE} };
    let minLen = Infinity;
    function dfs(node, len, visited) {
      if (node === 'E') { minLen = Math.min(minLen, len); return; }
      for (let n in graph[node]) { if (!visited.includes(n)) dfs(n, len + graph[node][n], [...visited, n]); }
    }
    dfs('A', 0, ['A']);
    return {
      vars: { w, minLen },
      answer: String(minLen),
      solution: `Перебирая все пути из A в E, кратчайший имеет длину <b>${minLen}</b>.`,
      hideFromChat: ['minLen'],
    };
  });

  export function check(answer) {
    return !!$vars && parseInt(answer) === $vars.minLen;
  }
</script>

{#if $vars}
<div>
  <p class="vk-row-sub" style="margin-bottom: 8px;">Определите длину <b>самого короткого</b> пути между пунктами <b>A</b> и <b>E</b>.</p>
  <div style="overflow-x: auto;">
    <table class="vk-task-table">
      <thead>
        <tr><th></th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th></tr>
      </thead>
      <tbody>
        <tr><th>A</th><td>-</td><td>{$vars.w.AB}</td><td>{$vars.w.AC}</td><td>-</td><td>-</td></tr>
        <tr><th>B</th><td>{$vars.w.AB}</td><td>-</td><td>{$vars.w.BC}</td><td>{$vars.w.BD}</td><td>-</td></tr>
        <tr><th>C</th><td>{$vars.w.AC}</td><td>{$vars.w.BC}</td><td>-</td><td>{$vars.w.CD}</td><td>{$vars.w.CE}</td></tr>
        <tr><th>D</th><td>-</td><td>{$vars.w.BD}</td><td>{$vars.w.CD}</td><td>-</td><td>{$vars.w.DE}</td></tr>
        <tr><th>E</th><td>-</td><td>-</td><td>{$vars.w.CE}</td><td>{$vars.w.DE}</td><td>-</td></tr>
      </tbody>
    </table>
  </div>
</div>
{/if}
