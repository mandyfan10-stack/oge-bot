<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { getRandomInt, getRandomElement } from '../utils.js';

  let vars = null;

  onMount(() => {
    const limit = getRandomInt(10, 49);
    const parity = getRandomElement(['чётное', 'нечётное']);
    const tpls = [
      { sign: '>', op: 'И', truth: 'ИСТИННО', find: 'наименьшее', calc: (a, par) => { let x=a+1; while(true){ if((par==='чётное'?x%2===0:x%2!==0)) return x; x++; } }, logicStr: `(X > ${limit}) И (X ${parity})` },
      { sign: '<', op: 'И', truth: 'ИСТИННО', find: 'наибольшее', calc: (a, par) => { let x=a-1; while(true){ if((par==='чётное'?x%2===0:x%2!==0)) return x; x--; } }, logicStr: `(X < ${limit}) И (X ${parity})` },
      { sign: '<', op: 'ИЛИ', truth: 'ЛОЖНО', find: 'наименьшее', calc: (a, par) => { let x=a; while(true){ if((par==='чётное'?x%2!==0:x%2===0)) return x; x++; } }, logicStr: `(X < ${limit}) ИЛИ (X ${parity})` },
      { sign: '>', op: 'ИЛИ', truth: 'ЛОЖНО', find: 'наибольшее', calc: (a, par) => { let x=a; while(true){ if((par==='чётное'?x%2!==0:x%2===0)) return x; x--; } }, logicStr: `(X > ${limit}) ИЛИ (X ${parity})` }
    ];
    const sel = getRandomElement(tpls);
    const target = sel.calc(limit, parity);
    vars = { logicStr: sel.logicStr, findStr: sel.find, truth: sel.truth, target };
    taskVariables.set(vars);
    correctAnswer.set(target);
  });

  export function check(answer) {
    return parseInt(answer) === vars.target;
  }
</script>

{#if vars}
<div class="space-y-6 animate-fade">
  <h3 class="font-medium text-zinc-800 text-lg">Задание 3: Логика</h3>
  <p class="text-sm text-zinc-500 font-light">Найдите <b>{vars.findStr}</b> целое число X, для которого <b>{vars.truth}</b> высказывание:</p>
  <div class="p-4 bg-pink-50 border border-pink-100 rounded-2xl font-mono text-center text-pink-700 font-bold">{vars.logicStr}</div>
</div>
{/if}