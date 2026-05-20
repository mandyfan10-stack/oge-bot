<script>
  import { setupTask } from '../taskSetup.js';
  import { getRandomElement, shuffleArray } from '../utils.js';

  const vars = setupTask(() => {
    const categories = [
      { name: 'Животные',         words: ['ёж','волк','слон','олень','собака','медведь','леопард','крокодил'] },
      { name: 'Фрукты',           words: ['киви','слива','банан','яблоко','абрикос','апельсин','виноград','мандарин'] },
      { name: 'Предметы мебели',  words: ['пуф','стул','диван','кресло','кровать','тумбочка','оттоманка','раскладушка'] },
      { name: 'Реки',             words: ['Обь','Дон','Нева','Амур','Волга','Енисей','Печора','Колыма'] },
      { name: 'Города',           words: ['Уфа','Омск','Сочи','Москва','Казань','Самара','Воронеж','Новосибирск'] },
    ];
    const encodings = [
      { bits: 8,  bytes: 1, name: 'КОИ-8' },
      { bits: 16, bytes: 2, name: 'Unicode' },
      { bits: 32, bytes: 4, name: 'UTF-32' },
    ];
    const cat = getRandomElement(categories);
    const enc = getRandomElement(encodings);
    const shuffled = shuffleArray([...cat.words]);
    const targetWord = getRandomElement(shuffled);
    const diffBytes = (targetWord.length + 2) * enc.bytes;
    const text = `${cat.name}: ${shuffled.join(', ')}.`;
    return {
      vars: { text, targetWord, diffBytes, bits: enc.bits, name: enc.name, bytes: enc.bytes },
      answer: targetWord.toLowerCase(),
    };
  });

  export function check(answer) {
    return !!$vars && answer.trim().toLowerCase() === $vars.targetWord.toLowerCase();
  }
</script>

{#if $vars}
<div>
  <p class="vk-row-sub" style="margin-bottom: 8px;">
    В кодировке <strong>{$vars.name}</strong> каждый символ кодируется <strong>{$vars.bits} бит</strong>.
    Ученик написал текст (без лишних пробелов):
  </p>
  <blockquote style="margin: 8px 0; padding: 8px 12px; background: var(--vk-bg); border-left: 3px solid var(--vk-btn); font-size: 13px;">
    «{$vars.text}»
  </blockquote>
  <p class="vk-row-sub" style="margin-top: 8px;">
    Ученик удалил одно название и лишние запятую и пробел.
    Размер нового предложения оказался на <strong>{$vars.diffBytes} байт</strong> меньше.
    Напишите удалённое слово.
  </p>
</div>
{/if}
