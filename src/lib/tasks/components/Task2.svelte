<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { getRandomInt, getRandomElement, shuffleArray } from '../utils.js';

  let vars = null;

  onMount(() => {
    const chars = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЬЮЯ".split('');
    const selectedChars = shuffleArray(chars).slice(0, 4);
    const codes = shuffleArray(['00', '01', '100', '101', '110', '111']);
    
    let table = {};
    let htmlTable = [];
    selectedChars.forEach((c, i) => {
       table[c] = codes[i];
       htmlTable.push({ char: c, code: codes[i] });
    });
    
    const wordLen = getRandomInt(3, 4);
    let targetWord = '';
    let encoded = '';
    for(let i=0; i<wordLen; i++) {
       const rc = getRandomElement(selectedChars);
       targetWord += rc;
       encoded += table[rc];
    }

    vars = { targetWord, encoded, table, htmlTable };
    taskVariables.set(vars);
    correctAnswer.set(targetWord.toUpperCase());
  });

  export function check(answer) {
    return answer.trim().toUpperCase() === vars.targetWord.toUpperCase();
  }
</script>

{#if vars}
<div class="space-y-6 animate-fade">
  <div>
    <h3 class="font-medium text-zinc-800 text-lg">Задание 2: Шифровальщик</h3>
    <p class="text-sm text-zinc-500 font-light mt-1">Расшифруй сообщение, используя таблицу кодировки.</p>
  </div>
  <div class="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
    <span class="font-mono text-emerald-700 tracking-[0.3em] text-lg font-bold">{vars.encoded}</span>
  </div>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
    <table class="w-full text-sm text-center font-mono border-collapse">
      <thead class="bg-slate-50 border-b border-slate-200 text-slate-500">
        <tr><th class="p-2 font-medium border border-slate-200">Буква</th><th class="p-2 font-medium border border-slate-200">Код</th></tr>
      </thead>
      <tbody class="text-slate-700">
        {#each vars.htmlTable as row}
          <tr>
            <td class="p-2 border border-slate-200">{row.char}</td>
            <td class="p-2 border border-slate-200 text-emerald-600 font-bold">{row.code}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
{/if}