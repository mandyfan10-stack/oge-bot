<script>
  import { setupTask } from '../taskSetup.js';
  import { shuffleArray } from '../utils.js';

  let editorHtml = '';
  let mapRef = null;

  // Extract all text nodes wrapped in any of the given tags.
  function extractFormatted(html, tags) {
    const result = new Set();
    for (const tag of tags) {
      const re = new RegExp(`<${tag}\\b[^>]*>([^<]*)</${tag}>`, 'gi');
      let m;
      while ((m = re.exec(html))) {
        const text = m[1].trim();
        if (text) result.add(text);
      }
    }
    return result;
  }

  const vars = setupTask(() => {
    const text = 'Байкал — самое глубокое озеро на планете. В нём обитает уникальная нерпа.';
    const shuffled = shuffleArray(['Байкал', 'озеро', 'нерпа']);
    const map = { bold: shuffled[0], underline: shuffled[1], italic: shuffled[2] };
    mapRef = map;
    editorHtml = text;
    return {
      vars: { text, map },
      answer: 'formatted',
      solution: `Нужно: «${map.bold}» — <b>жирным</b>, «${map.underline}» — <u>подчёркнутым</u>, «${map.italic}» — <i>курсивом</i>.`,
      hideFromChat: ['map'],
    };
  });

  export function check() {
    if (!mapRef) return false;
    const bolds = extractFormatted(editorHtml, ['b', 'strong']);
    const unders = extractFormatted(editorHtml, ['u']);
    const itals = extractFormatted(editorHtml, ['i', 'em']);
    return bolds.has(mapRef.bold)
        && unders.has(mapRef.underline)
        && itals.has(mapRef.italic);
  }
</script>

{#if $vars}
<div>
  <p class="vk-row-sub" style="margin-bottom: 8px;">
    Сделайте <b>{$vars.map.bold}</b> жирным, <b>{$vars.map.underline}</b> подчёркнутым, а <b>{$vars.map.italic}</b> курсивом.
  </p>
  <div
    bind:innerHTML={editorHtml}
    contenteditable="true"
    style="padding: 12px; border: 2px dashed var(--vk-border); font-size: 13px; color: var(--vk-text-2); outline: none; background: var(--vk-panel); min-height: 80px; line-height: 1.6;"
  ></div>
  <p class="vk-row-sub" style="margin-top: 6px; font-size: 11px; color: var(--vk-muted);">Используйте Ctrl+B, Ctrl+U, Ctrl+I для форматирования.</p>
</div>
{/if}
