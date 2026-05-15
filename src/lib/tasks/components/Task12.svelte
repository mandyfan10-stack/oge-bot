<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { getRandomInt, getRandomElement } from '../utils.js';

  let vars = null;

  onMount(() => {
    const names = ['doc', 'report', 'test', 'data']; const exts = ['pdf', 'txt', 'docx', 'jpg'];
    let files = []; for(let i=0; i<8; i++) files.push(`${getRandomElement(names)}${getRandomInt(1,99)}.${getRandomElement(exts)}`);
    const targetMask = `*.${files[0].split('.')[1].substring(0, 2)}*`;
    const regex = new RegExp('^.*\\.' + files[0].split('.')[1].substring(0, 2) + '.*$', 'i');
    let ans = 0; files.forEach(f => { if (regex.test(f)) ans++; });
    vars = { files, targetMask, ans };
    taskVariables.set(vars);
    correctAnswer.set(ans);
  });

  export function check(answer) {
    return parseInt(answer) === vars.ans;
  }
</script>

{#if vars}
<div class="space-y-6 animate-fade">
  <h3 class="font-medium text-zinc-800 text-lg">Задание 12: Маски файлов</h3>
  <p class="text-sm text-zinc-500 font-light">Сколько файлов удовлетворяют маске <b>{vars.targetMask}</b>?</p>
  <div class="bg-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-400 h-[120px] overflow-y-auto shadow-inner">
    {#each vars.files as f, i}
      <div>{i+1}. {f}</div>
    {/each}
  </div>
</div>
{/if}