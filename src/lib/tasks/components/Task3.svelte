<script>
  import { setupTask } from '../taskSetup.js';
  import { getRandomInt, getRandomElement } from '../utils.js';

  const vars = setupTask(() => {
    const limit = getRandomInt(10, 49);
    const parity = getRandomElement(['чётное', 'нечётное']);
    const tpls = [
      { sign: '>', op: 'И', truth: 'ИСТИННО', find: 'наименьшее', calc: (a, par) => { let x = a + 1; while (true) { if (par === 'чётное' ? x % 2 === 0 : x % 2 !== 0) return x; x++; } }, logicStr: `(X > ${limit}) И (X — ${parity})` },
      { sign: '<', op: 'И', truth: 'ИСТИННО', find: 'наибольшее', calc: (a, par) => { let x = a - 1; while (true) { if (par === 'чётное' ? x % 2 === 0 : x % 2 !== 0) return x; x--; } }, logicStr: `(X < ${limit}) И (X — ${parity})` },
      { sign: '<', op: 'ИЛИ', truth: 'ЛОЖНО', find: 'наименьшее', calc: (a, par) => { let x = a; while (true) { if (par === 'чётное' ? x % 2 !== 0 : x % 2 === 0) return x; x++; } }, logicStr: `(X < ${limit}) ИЛИ (X — ${parity})` },
      { sign: '>', op: 'ИЛИ', truth: 'ЛОЖНО', find: 'наибольшее', calc: (a, par) => { let x = a; while (true) { if (par === 'чётное' ? x % 2 !== 0 : x % 2 === 0) return x; x--; } }, logicStr: `(X > ${limit}) ИЛИ (X — ${parity})` },
    ];
    const sel = getRandomElement(tpls);
    const target = sel.calc(limit, parity);
    return {
      vars: { logicStr: sel.logicStr, findStr: sel.find, truth: sel.truth, target },
      answer: String(target),
      solution: `Ищем ${sel.find} X, при котором выражение «${sel.logicStr}» = ${sel.truth}. Перебираем значения — ответ: <b>${target}</b>.`,
    };
  });

  export function check(answer) {
    return !!$vars && parseInt(answer) === $vars.target;
  }
</script>

{#if $vars}
<div>
  <p class="vk-row-sub" style="margin-bottom: 8px;">Найдите <b>{$vars.findStr}</b> целое число X, для которого <b>{$vars.truth}</b> высказывание:</p>
  <div class="vk-task-highlight" style="font-weight: 700; color: var(--vk-link);">{$vars.logicStr}</div>
</div>
{/if}
