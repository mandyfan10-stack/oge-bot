<script>
  import { setupTask } from '../taskSetup.js';
  import { getRandomInt } from '../utils.js';

  const vars = setupTask(() => {
    const start = getRandomInt(0, 5);
    const stop = getRandomInt(10, 20);
    return {
      vars: { start, stop },
      answer: String(stop - 1),
      solution: `<code>range(${start}, ${stop})</code> генерирует числа от ${start} до ${stop - 1}. Последнее выведенное: <b>${stop - 1}</b>.`,
    };
  });

  export function check(answer) {
    return !!$vars && parseInt(answer) === $vars.stop - 1;
  }
</script>

{#if $vars}
<div>
  <div class="vk-task-code">
    <code>for i in range({$vars.start}, {$vars.stop}):<br>&nbsp;&nbsp;print(i)</code>
  </div>
  <p class="vk-row-sub">Какое <b>последнее</b> число выведет программа?</p>
</div>
{/if}
