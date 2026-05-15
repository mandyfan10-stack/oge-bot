<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { getRandomInt, getRandomElement, getRandomBool } from '../utils.js';

  let vars = null;

  onMount(() => {
    const ops = ['or', 'and']; const signs = ['<', '>', '<=', '>='];
    const variant = getRandomElement(['basic', 'not', 'div']);
    const op = getRandomElement(ops); const signS = getRandomElement(signs); const signT = getRandomElement(signs);
    const A = getRandomInt(-5, 12); const B = getRandomInt(-5, 12);
    const pairs = []; let yesCount = 0; let noCount = 0;
    for (let i = 0; i < 9; i++) {
      const s = getRandomInt(-10, 20); const t = getRandomInt(-10, 20); pairs.push(`(${s}, ${t})`);
      let valS = s; let valT = t; if (variant === 'div') { valS = Math.floor(s / 2); valT = Math.floor(t / 2); }
      let condS = false; if (signS === '<') condS = valS < A; else if (signS === '>') condS = valS > A; else if (signS === '<=') condS = valS <= A; else if (signS === '>=') condS = valS >= A;
      let condT = false; if (signT === '<') condT = valT < B; else if (signT === '>') condT = valT > B; else if (signT === '<=') condT = valT <= B; else if (signT === '>=') condT = valT >= B;
      let isYes = op === 'or' ? (condS || condT) : (condS && condT); if (variant === 'not') isYes = !isYes;
      if (isYes) yesCount++; else noCount++;
    }
    const askFor = getRandomBool() ? 'YES' : 'NO';
    const targetCount = askFor === 'YES' ? yesCount : noCount;
    let code = (variant === 'div') ? `if s // 2 ${signS} ${A} ${op} t // 2 ${signT} ${B}:` : (variant === 'not' ? `if not(s ${signS} ${A} ${op} t ${signT} ${B}):` : `if s ${signS} ${A} ${op} t ${signT} ${B}:`);
    vars = { code, pairs, askFor, targetCount };
    taskVariables.set(vars);
    correctAnswer.set(targetCount);
  });

  export function check(answer) {
    return parseInt(answer) === vars.targetCount;
  }
</script>

{#if vars}
<div class="space-y-6 animate-fade">
  <h3 class="font-medium text-zinc-800 text-lg">Задание 6: Анализ программы</h3>
  <p class="text-sm text-zinc-500 font-light">Сколько было запусков, при которых программа напечатала <b class="text-slate-800">«{vars.askFor}»</b>?</p>
  <div class="bg-slate-800 p-5 rounded-2xl text-emerald-400 font-mono text-sm shadow-xl overflow-x-auto">
    <code>{vars.code}<br>&nbsp;&nbsp;print("YES")<br>else:<br>&nbsp;&nbsp;print("NO")</code>
  </div>
  <div class="p-4 bg-slate-100 border border-slate-200 rounded-2xl font-mono text-xs text-slate-600 text-center">{vars.pairs.join('; ')}</div>
</div>
{/if}