<script>
  import { setupTask } from '../taskSetup.js';
  import { getRandomInt } from '../utils.js';

  const vars = setupTask(() => {
    const a = getRandomInt(2, 5);
    const b = getRandomInt(1, 10);
    const x = getRandomInt(2, 6);
    const ans = x * a + b;
    return {
      vars: { a, b, x, ans },
      answer: String(ans),
      solution: `f(${x}) = ${x}×${a} + ${b} = ${x * a} + ${b} = <b>${ans}</b>.`,
    };
  });

  export function check(answer) {
    return !!$vars && parseInt(answer) === $vars.ans;
  }
</script>

{#if $vars}
<div>
  <div class="vk-task-code">
    <code>def f(x): return x * {$vars.a} + {$vars.b}<br>print(f({$vars.x}))</code>
  </div>
  <p class="vk-row-sub">Что выведет программа?</p>
</div>
{/if}
