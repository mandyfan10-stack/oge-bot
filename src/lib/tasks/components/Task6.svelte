<script>
  import { setupTask } from '../taskSetup.js';
  import { getRandomInt, getRandomElement, getRandomBool } from '../utils.js';

  const vars = setupTask(() => {
    const ops = ['or', 'and']; const signs = ['<', '>', '<=', '>='];
    const variant = getRandomElement(['basic', 'not', 'div']);
    const op = getRandomElement(ops); const signS = getRandomElement(signs); const signT = getRandomElement(signs);
    const A = getRandomInt(-5, 12); const B = getRandomInt(-5, 12);
    const pairs = []; let yesCount = 0; let noCount = 0;
    for (let i = 0; i < 9; i++) {
      const s = getRandomInt(-10, 20); const t = getRandomInt(-10, 20); pairs.push(`(${s}, ${t})`);
      let valS = s; let valT = t;
      if (variant === 'div') { valS = Math.floor(s / 2); valT = Math.floor(t / 2); }
      let condS = false;
      if (signS === '<') condS = valS < A; else if (signS === '>') condS = valS > A;
      else if (signS === '<=') condS = valS <= A; else if (signS === '>=') condS = valS >= A;
      let condT = false;
      if (signT === '<') condT = valT < B; else if (signT === '>') condT = valT > B;
      else if (signT === '<=') condT = valT <= B; else if (signT === '>=') condT = valT >= B;
      let isYes = op === 'or' ? (condS || condT) : (condS && condT);
      if (variant === 'not') isYes = !isYes;
      if (isYes) yesCount++; else noCount++;
    }
    const askFor = getRandomBool() ? 'YES' : 'NO';
    const targetCount = askFor === 'YES' ? yesCount : noCount;
    let code = variant === 'div'
      ? `if s // 2 ${signS} ${A} ${op} t // 2 ${signT} ${B}:`
      : variant === 'not'
        ? `if not(s ${signS} ${A} ${op} t ${signT} ${B}):`
        : `if s ${signS} ${A} ${op} t ${signT} ${B}:`;
    return {
      vars: { code, pairs, askFor, targetCount },
      answer: String(targetCount),
      solution: `Проверяем каждую из ${pairs.length} пар по условию. Количество запусков с выводом «${askFor}»: <b>${targetCount}</b>.`,
    };
  });

  export function check(answer) {
    return !!$vars && parseInt(answer) === $vars.targetCount;
  }
</script>

{#if $vars}
<div>
  <p class="vk-row-sub" style="margin-bottom: 8px;">Сколько было запусков, при которых программа напечатала <b>«{$vars.askFor}»</b>?</p>
  <div class="vk-task-code">
    <code>{$vars.code}<br>&nbsp;&nbsp;print("YES")<br>else:<br>&nbsp;&nbsp;print("NO")</code>
  </div>
  <div class="vk-task-highlight" style="font-size: 11px; word-break: break-all;">{$vars.pairs.join('; ')}</div>
</div>
{/if}
