<script>
  import { setupTask } from '../taskSetup.js';
  import { getRandomInt, shuffleArray } from '../utils.js';

  let localFull = '';
  let pieces = [];
  let assembled = '';

  const vars = setupTask(() => {
    const p = [getRandomInt(10, 200), getRandomInt(10, 200), getRandomInt(10, 200), getRandomInt(10, 200)];
    localFull = p.join('.');
    pieces = shuffleArray([p[0] + '.', p[1].toString(), '.' + p[2], '.' + p[3]]);
    assembled = '';
    return {
      vars: { p, full: localFull },
      answer: localFull,
      solution: `IP-адрес состоит из 4 октетов через точку. Собираем: <b>${localFull}</b>.`,
    };
  });

  function addPiece(p) {
    assembled += p;
  }

  function reset() {
    assembled = '';
  }

  export function check() {
    return assembled === localFull;
  }
</script>

{#if $vars}
<div>
  <p class="vk-row-sub" style="margin-bottom: 8px;">Соберите IP-адрес: <code style="color: var(--vk-link); font-weight: 700;">{$vars.full}</code></p>
  <div class="vk-task-display">{assembled || '...'}</div>
  <div class="vk-task-chips">
    {#each pieces as b}
      <button class="vk-task-chip" on:click={() => addPiece(b)}>{b}</button>
    {/each}
    <button class="vk-task-chip" style="color: var(--vk-error); border-color: var(--vk-error);" on:click={reset}>Сброс</button>
  </div>
</div>
{/if}
