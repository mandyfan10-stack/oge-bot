<script>
  import { setupTask } from '../taskSetup.js';
  import { getRandomInt } from '../utils.js';

  const vars = setupTask(() => {
    const arr = Array.from({ length: 5 }, () => getRandomInt(10, 99));
    const idx = getRandomInt(0, 4);
    return {
      vars: { arr, index: idx, target: arr[idx] },
      answer: String(arr[idx]),
      solution: `<code>arr[${idx}]</code> — элемент с индексом ${idx} (нумерация с 0). Значение: <b>${arr[idx]}</b>.`,
      hideFromChat: ['target'],
    };
  });

  export function check(answer) {
    return !!$vars && parseInt(answer) === $vars.target;
  }
</script>

{#if $vars}
<div>
  <div class="vk-task-code">
    <code>arr = [{$vars.arr.join(', ')}]<br>print(arr[{$vars.index}])</code>
  </div>
  <p class="vk-row-sub">Что выведет программа?</p>
</div>
{/if}
