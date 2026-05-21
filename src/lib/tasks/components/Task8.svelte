<script>
  import { setupTask } from '../taskSetup.js';
  import { getRandomInt, getRandomElement, shuffleArray } from '../utils.js';

  const vars = setupTask(() => {
    const words = [['Коты', 'Собаки'], ['Розы', 'Тюльпаны'], ['Чай', 'Кофе']];
    const pair = getRandomElement(words);
    const A = getRandomInt(200, 599); const B = getRandomInt(200, 599);
    const Inter = Math.floor(Math.random() * 100) + 10;
    const Union = A + B - Inter;
    const types = [
      { q: `${pair[0]} | ${pair[1]}`, ans: Union, table: [[pair[0], A], [pair[1], B], [`${pair[0]} & ${pair[1]}`, Inter]] },
      { q: `${pair[0]} & ${pair[1]}`, ans: Inter, table: [[pair[0], A], [pair[1], B], [`${pair[0]} | ${pair[1]}`, Union]] },
    ];
    const sel = getRandomElement(types);
    return {
      vars: { q: sel.q, ans: sel.ans, table: shuffleArray(sel.table) },
      answer: String(sel.ans),
      solution: `|${pair[0]}| = ${A}, |${pair[1]}| = ${B}, |пересечение| = ${Inter}. По формуле объединения: ${A}+${B}−${Inter} = ${Union}. Ответ на запрос «${sel.q}»: <b>${sel.ans}</b>.`,
    };
  });

  export function check(answer) {
    return !!$vars && parseInt(answer) === $vars.ans;
  }
</script>

{#if $vars}
<div>
  <p class="vk-row-sub" style="margin-bottom: 8px;">Определи количество страниц (в тыс.) по запросу <b>{$vars.q}</b>.</p>
  <table class="vk-task-table">
    <thead><tr><th>Запрос</th><th>Найдено</th></tr></thead>
    <tbody>
      {#each $vars.table as row}
        <tr><td style="text-align: left;">{row[0]}</td><td>{row[1]}</td></tr>
      {/each}
    </tbody>
  </table>
</div>
{/if}
