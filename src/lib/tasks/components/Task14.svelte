<script>
  import { setupTask } from '../taskSetup.js';
  import { getRandomInt, getRandomElement } from '../utils.js';

  const vars = setupTask(() => {
    const subjects = ['информатика', 'алгебра', 'физика'];
    const data = Array.from({ length: 6 }, () => ({ sub: getRandomElement(subjects), score: getRandomInt(2, 5), name: 'Ученик' }));
    const targetSub = getRandomElement(subjects);
    let q1Ans = 0;
    data.forEach(d => { if (d.sub === targetSub) q1Ans++; });
    return {
      vars: { data, targetSub, q1Ans },
      answer: String(q1Ans),
      solution: `Подсчитываем строки с предметом «${targetSub}» в таблице. Ответ: <b>${q1Ans}</b>.`,
      hideFromChat: ['q1Ans'],
    };
  });

  export function check(answer) {
    return !!$vars && parseInt(answer) === $vars.q1Ans;
  }
</script>

{#if $vars}
<div>
  <p class="vk-row-sub" style="margin-bottom: 8px;">Сколько учеников любят предмет <b>{$vars.targetSub}</b>?</p>
  <table class="vk-task-table">
    <thead><tr><th>Предмет</th><th>Балл</th></tr></thead>
    <tbody>
      {#each $vars.data as r}
        <tr
          style={r.sub === $vars.targetSub ? 'background: var(--vk-row-h);' : ''}
        >
          <td>{r.sub}</td>
          <td>{r.score}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
{/if}
