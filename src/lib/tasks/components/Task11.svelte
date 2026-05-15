<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { getRandomInt, getRandomElement } from '../utils.js';

  let vars = null;

  onMount(() => {
    const targetWord = getRandomElement(["код", "байт", "цикл", "сеть", "данные"]); const count = getRandomInt(2, 5);
    let text = "Информатика — это наука, изучающая методы сбора и хранения информации. Основным элементом здесь является алгоритм.".split(' ');
    for(let i=0; i<count; i++) text.splice(getRandomInt(0, text.length-1), 0, targetWord);
    vars = { target: targetWord, text: text.join(' '), count };
    taskVariables.set(vars);
    correctAnswer.set(count);
  });

  export function check(answer) {
    return parseInt(answer) === vars.count;
  }
</script>

{#if vars}
<div class="space-y-6 animate-fade">
  <h3 class="font-medium text-zinc-800 text-lg">Задание 11: Поиск</h3>
  <p class="text-sm text-zinc-500 font-light">Сколько раз встречается слово <b>«{vars.target}»</b> в тексте?</p>
  <div class="bg-slate-50 rounded-2xl border border-slate-200 p-5 font-serif text-sm text-slate-700 leading-relaxed max-h-[150px] overflow-y-auto shadow-inner">{vars.text}</div>
</div>
{/if}