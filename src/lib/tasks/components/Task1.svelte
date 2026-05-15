<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { getRandomElement, shuffleArray } from '../utils.js';

  let vars = null;

  onMount(() => {
    const categories = [
      { name: 'Животные', words: ['ёж', 'волк', 'слон', 'олень', 'собака', 'медведь', 'леопард', 'крокодил'] },
      { name: 'Фрукты', words: ['киви', 'слива', 'банан', 'яблоко', 'абрикос', 'апельсин', 'виноград', 'мандарин'] },
      { name: 'Предметы мебели', words: ['пуф', 'стул', 'диван', 'кресло', 'кровать', 'тумбочка', 'оттоманка', 'раскладушка'] },
      { name: 'Реки', words: ['Обь', 'Дон', 'Нева', 'Амур', 'Волга', 'Енисей', 'Печора', 'Колыма'] },
      { name: 'Города', words: ['Уфа', 'Омск', 'Сочи', 'Москва', 'Казань', 'Самара', 'Воронеж', 'Новосибирск'] }
    ];
    const cat = getRandomElement(categories);
    const encodings = [ {bits: 8, bytes: 1, name: 'КОИ-8'}, {bits: 16, bytes: 2, name: 'Unicode'}, {bits: 32, bytes: 4, name: 'UTF-32'} ];
    const enc = getRandomElement(encodings);
    
    const shuffledWords = shuffleArray([...cat.words]);
    const targetWord = getRandomElement(shuffledWords);
    
    const diffBytes = (targetWord.length + 2) * enc.bytes;
    const text = `${cat.name}: ${shuffledWords.join(', ')}.`;
    
    vars = { text, targetWord, diffBytes, bits: enc.bits, name: enc.name, bytes: enc.bytes };
    taskVariables.set(vars);
    correctAnswer.set(targetWord.toLowerCase());
  });

  export function check(answer) {
    return answer.trim().toLowerCase() === vars.targetWord.toLowerCase();
  }
</script>

{#if vars}
<div class="space-y-6 animate-fade">
  <div>
    <h3 class="font-medium text-zinc-800 text-lg">Задание 1: Объем информации</h3>
    <p class="text-sm text-zinc-500 font-light mt-1">В одной из кодировок {vars.name} каждый символ кодируется <b>{vars.bits} битами</b>. Ученик написал текст (в нём нет лишних пробелов):</p>
  </div>
  <div class="p-5 bg-slate-100 border border-slate-200 rounded-2xl font-serif text-[15px] text-slate-800 leading-relaxed shadow-inner">«{vars.text}»</div>
  <p class="text-sm text-zinc-500 font-light leading-relaxed">Ученик удалил из списка одно из названий. Заодно он вычеркнул ставшие лишними запятые и пробелы. При этом размер нового предложения оказался на <b class="text-indigo-600 font-medium">{vars.diffBytes} байт</b> меньше. Напишите удаленное слово.</p>
</div>
{/if}