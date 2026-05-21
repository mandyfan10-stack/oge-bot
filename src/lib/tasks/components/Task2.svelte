<script>
  import { setupTask } from '../taskSetup.js';
  import { getRandomInt, getRandomElement, shuffleArray } from '../utils.js';

  const vars = setupTask(() => {
    const chars = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЬЮЯ".split('');
    const selectedChars = shuffleArray(chars).slice(0, 4);
    const codes = shuffleArray(['00', '01', '100', '101', '110', '111']);
    let table = {};
    let htmlTable = [];
    selectedChars.forEach((c, i) => { table[c] = codes[i]; htmlTable.push({ char: c, code: codes[i] }); });
    const wordLen = getRandomInt(3, 4);
    let targetWord = '';
    let encoded = '';
    for (let i = 0; i < wordLen; i++) {
      const rc = getRandomElement(selectedChars);
      targetWord += rc;
      encoded += table[rc];
    }
    return {
      vars: { targetWord, encoded, htmlTable },
      answer: targetWord.toUpperCase(),
      solution: `Расшифровываем последовательность «${encoded}» по таблице: ${htmlTable.map(r => `${r.char}=${r.code}`).join(', ')}. Ответ: <b>${targetWord.toUpperCase()}</b>.`,
    };
  });

  export function check(answer) {
    return !!$vars && answer.trim().toUpperCase() === $vars.targetWord.toUpperCase();
  }
</script>

{#if $vars}
<div>
  <p class="vk-row-sub" style="margin-bottom: 8px;">Расшифруй сообщение, используя таблицу кодировки.</p>
  <div class="vk-task-highlight" style="font-size: 16px; letter-spacing: 0.3em; font-weight: 700; color: var(--vk-success);">{$vars.encoded}</div>
  <table class="vk-task-table">
    <thead><tr><th>Буква</th><th>Код</th></tr></thead>
    <tbody>
      {#each $vars.htmlTable as row}
        <tr>
          <td>{row.char}</td>
          <td style="font-weight: 700; color: var(--vk-success);">{row.code}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
{/if}
