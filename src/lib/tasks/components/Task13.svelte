<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { shuffleArray } from '../utils.js';

  let vars = null;
  let editorHtml = '';

  onMount(() => {
    const v = { text: "Байкал — самое глубокое озеро на планете. В нём обитает уникальная нерпа.", words: ["Байкал", "озеро", "нерпа"] };
    const shuffled = shuffleArray([...v.words]);
    vars = { text: v.text, map: { bold: shuffled[0], underline: shuffled[1], italic: shuffled[2] } };
    editorHtml = v.text;
    taskVariables.set(vars);
    correctAnswer.set('Formatted');
  });

  export function check() {
    return editorHtml.includes('<b>') || editorHtml.includes('<strong>') || editorHtml.includes('<u>') || editorHtml.includes('<i>');
  }
</script>

{#if vars}
<div>
  <p class="vk-row-sub" style="margin-bottom: 8px;">
    Сделайте <b>{vars.map.bold}</b> жирным, <b>{vars.map.underline}</b> подчёркнутым, а <b>{vars.map.italic}</b> курсивом.
  </p>
  <div
    bind:innerHTML={editorHtml}
    contenteditable="true"
    style="padding: 12px; border: 2px dashed var(--vk-border); font-size: 13px; color: var(--vk-text-2); outline: none; background: var(--vk-panel); min-height: 80px; line-height: 1.6;"
  ></div>
  <p class="vk-row-sub" style="margin-top: 6px; font-size: 11px; color: var(--vk-muted);">Используйте Ctrl+B, Ctrl+U, Ctrl+I для форматирования.</p>
</div>
{/if}
