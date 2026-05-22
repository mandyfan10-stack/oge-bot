<script>
  import { setupTask } from '../taskSetup.js';
  import { getRandomInt, getRandomBool } from '../utils.js';

  const vars = setupTask(() => {
    const val1 = getRandomInt(20, 59); const val2 = getRandomInt(20, 59); const val3 = getRandomInt(20, 59);
    const findMax = getRandomBool();
    const target = findMax ? Math.max(val1, val2, val3) : Math.min(val1, val2, val3);
    const n1 = val1.toString(16).toUpperCase();
    const n2 = val2.toString(8);
    const n3 = val3.toString(2);
    const typeStr = findMax ? 'максимальное' : 'минимальное';
    return {
      vars: { typeStr, target, n1, n2, n3, val1, val2, val3 },
      answer: String(target),
      solution: `Переводим в десятичную: ${n1}<sub>16</sub> = ${val1}, ${n2}<sub>8</sub> = ${val2}, ${n3}<sub>2</sub> = ${val3}. ${typeStr.charAt(0).toUpperCase() + typeStr.slice(1)}: <b>${target}</b>.`,
      hideFromChat: ['target', 'val1', 'val2', 'val3'],
    };
  });

  export function check(answer) {
    return !!$vars && parseInt(answer) === $vars.target;
  }
</script>

{#if $vars}
<div>
  <p class="vk-row-sub" style="margin-bottom: 8px;">Найдите <b>{$vars.typeStr}</b> число и запишите его в десятичной системе.</p>
  <div class="vk-task-numbers">
    <span>{$vars.n1}<sub>16</sub></span>
    <span class="sep">|</span>
    <span>{$vars.n2}<sub>8</sub></span>
    <span class="sep">|</span>
    <span>{$vars.n3}<sub>2</sub></span>
  </div>
</div>
{/if}
