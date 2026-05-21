<script>
  import { setupTask } from '../taskSetup.js';
  import { getRandomInt, getRandomBool } from '../utils.js';

  const vars = setupTask(() => {
    const op2_type = getRandomBool() ? 'div' : 'mul';
    let b, A, start, end, seqArray;
    while (true) {
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
    const op2_text = op2_type === 'div' ? `раздели на b` : `умножь на b`;
    const seq = seqArray.join('');
    return {
      vars: { A, b, start, end, seq, op2_text },
      answer: String(b),
      solution: `Алгоритм: прибавь ${A} (команда 1), ${op2_text} (команда 2). Программа ${seq} переводит ${start} в ${end}. Подбором: b = <b>${b}</b>.`,
    };
  });

  export function check(answer) {
    return !!$vars && parseInt(answer) === $vars.b;
  }
</script>

{#if $vars}
<div>
  <p class="vk-row-sub" style="margin-bottom: 8px;">Исполнитель умеет выполнять две команды:</p>
  <div class="vk-task-highlight" style="text-align: left;">
    <div><b>1.</b> прибавь {$vars.A}</div>
    <div style="margin-top: 4px;"><b>2.</b> {$vars.op2_text}</div>
  </div>
  <p class="vk-row-sub">Программа <b>{$vars.seq}</b> переводит число <b>{$vars.start}</b> в число <b>{$vars.end}</b>. Определите натуральное <b>b ≥ 2</b>.</p>
</div>
{/if}
