<script>
  import { setupTask } from '../taskSetup.js';
  import { getRandomInt, getRandomElement } from '../utils.js';

  const vars = setupTask(() => {
    const targetWord = getRandomElement(["код", "байт", "цикл", "сеть", "данные"]);
    const count = getRandomInt(2, 5);
    let text = "Информатика — это наука, изучающая методы сбора и хранения информации. Основным элементом здесь является алгоритм.".split(' ');
    for (let i = 0; i < count; i++) text.splice(getRandomInt(0, text.length - 1), 0, targetWord);
    return {
      vars: { target: targetWord, text: text.join(' '), count },
      answer: String(count),
      solution: `Слово «${targetWord}» встречается в тексте <b>${count}</b> раз.`,
    };
  });

  export function check(answer) {
    return !!$vars && parseInt(answer) === $vars.count;
  }
</script>

{#if $vars}
<div>
  <p class="vk-row-sub" style="margin-bottom: 8px;">Сколько раз встречается слово <b>«{$vars.target}»</b> в тексте?</p>
  <div class="vk-task-quote" style="max-height: 140px; overflow-y: auto; font-family: 'PT Sans', serif; line-height: 1.6;">
    {$vars.text}
  </div>
</div>
{/if}
