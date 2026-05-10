import { currentTask, taskVariables, correctAnswer } from '../stores/taskStore.js';

// --- UTILS ---
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function getRandomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const renderers = {
  1: {
    init: () => {
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
      
      const diffBytes = (targetWord.length + 2) * enc.bytes; // +2 за запятую и пробел
      const text = `${cat.name}: ${shuffledWords.join(', ')}.`;
      
      const vars = { text, targetWord, diffBytes, bits: enc.bits, name: enc.name, bytes: enc.bytes };
      taskVariables.set(vars);
      correctAnswer.set(targetWord.toLowerCase());
      return vars;
    },
    html: (vars) => `
      <div class="glass-panel p-6 rounded-[2rem] space-y-6 animate-fade">
        <div>
          <h3 class="font-medium text-zinc-200 text-lg">Задание 1: Объем информации</h3>
          <p class="text-sm text-zinc-400 font-light mt-1">В одной из кодировок ${vars.name} каждый символ кодируется <b>${vars.bits} битами</b>. Ученик написал текст (в нём нет лишних пробелов):</p>
        </div>
        <div class="p-5 bg-[#0f111a] border border-white/5 rounded-2xl font-serif text-[15px] text-zinc-200 leading-relaxed shadow-inner">«${vars.text}»</div>
        <p class="text-sm text-zinc-400 font-light leading-relaxed">Ученик удалил из списка одно из названий. Заодно он вычеркнул ставшие лишними запятые и пробелы — два пробела не должны идти подряд.<br><br>При этом размер нового предложения в данной кодировке оказался на <b class="text-white font-medium">${vars.diffBytes} байт</b> меньше, чем размер исходного предложения. Напишите в ответе удаленное слово.</p>
      </div>
    `,
    check: (answer, vars) => answer.trim().toLowerCase() === vars.targetWord.toLowerCase()
  },
  2: {
    init: () => {
      const chars = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЬЮЯ".split('');
      const selectedChars = shuffleArray(chars).slice(0, 4);
      const codes = shuffleArray(['00', '01', '100', '101', '110', '111']);
      
      let table = {};
      let htmlTable = '';
      selectedChars.forEach((c, i) => {
         table[c] = codes[i];
         htmlTable += `<tr><td class="p-2">${c}</td><td class="p-2 text-emerald-400">${codes[i]}</td></tr>`;
      });
      
      const wordLen = getRandomInt(3, 4);
      let targetWord = '';
      let encoded = '';
      for(let i=0; i<wordLen; i++) {
         const rc = getRandomElement(selectedChars);
         targetWord += rc;
         encoded += table[rc];
      }

      const vars = { targetWord, encoded, table, htmlTable };
      taskVariables.set(vars);
      correctAnswer.set(targetWord.toUpperCase());
      return vars;
    },
    html: (vars) => `
      <div class="glass-panel p-6 rounded-[2rem] space-y-6 animate-fade">
        <div>
          <h3 class="font-medium text-zinc-200 text-lg">Задание 2: Шифровальщик</h3>
          <p class="text-sm text-zinc-400 font-light mt-1">Расшифруй сообщение, используя таблицу кодировки.</p>
        </div>
        <div class="p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-2xl text-center">
          <span class="font-mono text-emerald-400 tracking-[0.3em] text-lg">${vars.encoded}</span>
        </div>
        <div class="overflow-hidden rounded-xl border border-white/10 bg-black/40">
          <table class="w-full text-sm text-center font-mono">
            <thead class="bg-white/5 border-b border-white/10 text-zinc-400"><tr><th class="p-2 font-medium">Буква</th><th class="p-2 font-medium">Код</th></tr></thead>
            <tbody class="text-zinc-300 divide-y divide-white/5">${vars.htmlTable}</tbody>
          </table>
        </div>
      </div>
    `,
    check: (answer, vars) => answer.trim().toUpperCase() === vars.targetWord.toUpperCase()
  }
};

export function loadTask(id) {
    if(renderers[id]) {
        currentTask.set(id);
        renderers[id].init();
    }
}
