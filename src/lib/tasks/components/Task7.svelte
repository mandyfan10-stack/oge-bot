<script>
  import { setupTask } from '../taskSetup.js';
  import { getRandomElement, shuffleArray } from '../utils.js';

  let localVars = null;
  let pieces = [];
  let assembled = '';
  let disabledButtons = new Set();

  const vars = setupTask(() => {
    const protocols = ['http', 'https', 'ftp'];
    const domains = ['edu.ru', 'exam.net', 'test.org', 'school.com'];
    const files = ['index.htm', 'doc.pdf', 'image.jpg', 'archive.zip'];
    const p = getRandomElement(protocols); const d = getRandomElement(domains); const f = getRandomElement(files);
    const full = `${p}://${d}/${f}`;
    localVars = { parts: [p, d, f], full };
    pieces = shuffleArray(['://', '/', f, p, d]);
    assembled = '';
    disabledButtons = new Set();
    return {
      vars: localVars,
      answer: full,
      solution: `Схема URL: протокол + :// + домен + / + файл = <b>${full}</b>.`,
    };
  });

  function addPiece(p, index) {
    assembled += p;
    disabledButtons.add(index);
    disabledButtons = disabledButtons;
  }

  function reset() {
    assembled = '';
    disabledButtons = new Set();
  }

  export function check() {
    return localVars && assembled === localVars.full;
  }
</script>

{#if $vars}
<div>
  <p class="vk-row-sub" style="margin-bottom: 8px;">Собери адрес: <code style="font-size: 11px; color: var(--vk-link);">{$vars.full}</code></p>
  <div class="vk-task-display">{assembled || '...'}</div>
  <div class="vk-task-chips">
    {#each pieces as p, i}
      <button class="vk-task-chip" on:click={() => addPiece(p, i)} disabled={disabledButtons.has(i)}>{p}</button>
    {/each}
    <button class="vk-task-chip" style="color: var(--vk-error); border-color: var(--vk-error);" on:click={reset}>Сброс</button>
  </div>
</div>
{/if}
