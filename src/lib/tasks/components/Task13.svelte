<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { shuffleArray } from '../utils.js';

  let vars = null;
  let editorHtml = "";

  onMount(() => {
    const v = { text: "Байкал — самое глубокое озеро на планете. В нём обитает уникальная нерпа.", words: ["Байкал", "озеро", "нерпа"] };
    const shuffled = shuffleArray([...v.words]);
    vars = { text: v.text, map: { bold: shuffled[0], underline: shuffled[1], italic: shuffled[2] } };
    editorHtml = v.text;
    taskVariables.set(vars);
    correctAnswer.set("Formatted");
  });

  export function check() {
    return editorHtml.includes('<b>') || editorHtml.includes('<strong>') || editorHtml.includes('<u>') || editorHtml.includes('<i>');
  }
</script>

{#if vars}
<div class="space-y-6 animate-fade">
  <h3 class="font-medium text-zinc-800 text-lg">Задание 13.2: Редактор</h3>
  <p class="text-sm text-zinc-500 font-light">Сделайте <b>{vars.map.bold}</b> жирным, <b>{vars.map.underline}</b> подчеркнутым, а <b>{vars.map.italic}</b> курсивом.</p>
  <div bind:innerHTML={editorHtml} contenteditable="true" class="p-5 border-2 border-dashed border-slate-200 rounded-2xl text-sm text-slate-700 outline-none bg-white min-h-[100px]"></div>
  <p class="text-[10px] text-zinc-400 italic">Используйте Ctrl+B, Ctrl+U, Ctrl+I для форматирования.</p>
</div>
{/if}