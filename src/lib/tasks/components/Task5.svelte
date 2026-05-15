<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { getRandomInt, getRandomBool } from '../utils.js';

  let vars = null;

  onMount(() => {
    const op2_type = getRandomBool() ? 'div' : 'mul';
    let b, A, start, end, seqArray;
    while(true) {
        b = getRandomInt(2, 9); A = getRandomInt(1, 9); start = getRandomInt(10, 59);
        seqArray = Array(5).fill(1); const pos2 = getRandomInt(1, 3); seqArray[pos2] = 2;
        let curr = start; let valid = true;
        for (let cmd of seqArray) {
            if (cmd === 1) curr += A;
            else {
                if (op2_type === 'div') { if (curr % b !== 0) { valid = false; break; } curr /= b; }
                else curr *= b;
            }
        }
        if (valid && curr > 0 && curr !== start) { end = curr; break; }
    }
    const op2_text = op2_type === 'div' ? 'раздели на b' : 'умножь на b';
    vars = { A, b, start, end, seq: seqArray.join(''), op2_text };
    taskVariables.set(vars);
    correctAnswer.set(b);
  });

  export function check(answer) {
    return parseInt(answer) === vars.b;
  }
</script>

{#if vars}
<div class="space-y-6 animate-fade">
  <h3 class="font-medium text-zinc-800 text-lg">Задание 5: Анализ алгоритма</h3>
  <div class="p-5 bg-slate-100 border border-slate-200 rounded-2xl font-mono text-slate-700 shadow-inner space-y-2">
    <div><b class="text-indigo-600">1.</b> прибавь {vars.A}</div>
    <div><b class="text-indigo-600">2.</b> {vars.op2_text}</div>
  </div>
  <p class="text-sm text-zinc-500 font-light">Программа <b class="text-slate-800 bg-slate-200 px-1 rounded">{vars.seq}</b> переводит число <b class="text-slate-800">{vars.start}</b> в число <b class="text-slate-800">{vars.end}</b>. Определите натуральное <b>b ≥ 2</b>.</p>
</div>
{/if}