import { currentTask, taskVariables, correctAnswer } from '../stores/taskStore.js';

// --- UTILS ---
const cryptoSource = (typeof window !== 'undefined' && (window.crypto || window.msCrypto)) || null;
function randomUnit() {
  if (cryptoSource?.getRandomValues) {
    const buffer = new Uint32Array(1);
    cryptoSource.getRandomValues(buffer);
    return buffer[0] / 0x100000000;
  }
  return Math.random();
}
function getRandomInt(min, max) { return Math.floor(randomUnit() * (max - min + 1)) + min; }
function getRandomElement(arr) { return arr[Math.floor(randomUnit() * arr.length)]; }
function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomUnit() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function getRandomBool() { return randomUnit() > 0.5; }

export const renderers = {
  1: {
    init: (id) => {
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
      <div class="space-y-6 animate-fade">
        <div>
          <h3 class="font-medium text-zinc-800 text-lg">Задание 1: Объем информации</h3>
          <p class="text-sm text-zinc-500 font-light mt-1">В одной из кодировок ${vars.name} каждый символ кодируется <b>${vars.bits} битами</b>. Ученик написал текст (в нём нет лишних пробелов):</p>
        </div>
        <div class="p-5 bg-slate-100 border border-slate-200 rounded-2xl font-serif text-[15px] text-slate-800 leading-relaxed shadow-inner">«${vars.text}»</div>
        <p class="text-sm text-zinc-500 font-light leading-relaxed">Ученик удалил из списка одно из названий. Заодно он вычеркнул ставшие лишними запятые и пробелы. При этом размер нового предложения оказался на <b class="text-indigo-600 font-medium">${vars.diffBytes} байт</b> меньше. Напишите удаленное слово.</p>
      </div>
    `,
    check: (answer, vars) => answer.trim().toLowerCase() === vars.targetWord.toLowerCase()
  },
  2: {
    init: (id) => {
      const chars = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЬЮЯ".split('');
      const selectedChars = shuffleArray(chars).slice(0, 4);
      const codes = shuffleArray(['00', '01', '100', '101', '110', '111']);
      
      let table = {};
      let htmlTable = '';
      selectedChars.forEach((c, i) => {
         table[c] = codes[i];
         htmlTable += `<tr><td class="p-2 border border-slate-200">${c}</td><td class="p-2 border border-slate-200 text-emerald-600 font-bold">${codes[i]}</td></tr>`;
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
      <div class="space-y-6 animate-fade">
        <div>
          <h3 class="font-medium text-zinc-800 text-lg">Задание 2: Шифровальщик</h3>
          <p class="text-sm text-zinc-500 font-light mt-1">Расшифруй сообщение, используя таблицу кодировки.</p>
        </div>
        <div class="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
          <span class="font-mono text-emerald-700 tracking-[0.3em] text-lg font-bold">${vars.encoded}</span>
        </div>
        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table class="w-full text-sm text-center font-mono border-collapse">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-500"><tr><th class="p-2 font-medium border border-slate-200">Буква</th><th class="p-2 font-medium border border-slate-200">Код</th></tr></thead>
            <tbody class="text-slate-700">${vars.htmlTable}</tbody>
          </table>
        </div>
      </div>
    `,
    check: (answer, vars) => answer.trim().toUpperCase() === vars.targetWord.toUpperCase()
  },
  3: {
    init: (id) => {
      const limit = getRandomInt(10, 49);
      const parity = getRandomElement(['чётное', 'нечётное']);
      const tpls = [
        { sign: '>', op: 'И', truth: 'ИСТИННО', find: 'наименьшее', calc: (a, par) => { let x=a+1; while(true){ if((par==='чётное'?x%2===0:x%2!==0)) return x; x++; } }, logicStr: `(X > ${limit}) И (X ${parity})` },
        { sign: '<', op: 'И', truth: 'ИСТИННО', find: 'наибольшее', calc: (a, par) => { let x=a-1; while(true){ if((par==='чётное'?x%2===0:x%2!==0)) return x; x--; } }, logicStr: `(X < ${limit}) И (X ${parity})` },
        { sign: '<', op: 'ИЛИ', truth: 'ЛОЖНО', find: 'наименьшее', calc: (a, par) => { let x=a; while(true){ if((par==='чётное'?x%2!==0:x%2===0)) return x; x++; } }, logicStr: `(X < ${limit}) ИЛИ (X ${parity})` },
        { sign: '>', op: 'ИЛИ', truth: 'ЛОЖНО', find: 'наибольшее', calc: (a, par) => { let x=a; while(true){ if((par==='чётное'?x%2!==0:x%2===0)) return x; x--; } }, logicStr: `(X > ${limit}) ИЛИ (X ${parity})` }
      ];
      const sel = getRandomElement(tpls);
      const target = sel.calc(limit, parity);
      const vars = { logicStr: sel.logicStr, findStr: sel.find, truth: sel.truth, target };
      taskVariables.set(vars);
      correctAnswer.set(target);
      return vars;
    },
    html: (vars) => `
      <div class="space-y-6 animate-fade">
        <h3 class="font-medium text-zinc-800 text-lg">Задание 3: Логика</h3>
        <p class="text-sm text-zinc-500 font-light">Найдите <b>${vars.findStr}</b> целое число X, для которого <b>${vars.truth}</b> высказывание:</p>
        <div class="p-4 bg-pink-50 border border-pink-100 rounded-2xl font-mono text-center text-pink-700 font-bold">${vars.logicStr}</div>
      </div>
    `,
    check: (answer, vars) => parseInt(answer) === vars.target
  },
  4: {
    init: (id) => {
      const w = { AB: getRandomInt(1, 6), AC: getRandomInt(3, 10), BC: getRandomInt(1, 5), BD: getRandomInt(2, 8), CD: getRandomInt(1, 4), CE: getRandomInt(3, 9), DE: getRandomInt(1, 6) };
      const graph = { A: {B:w.AB, C:w.AC}, B: {A:w.AB, C:w.BC, D:w.BD}, C: {A:w.AC, B:w.BC, D:w.CD, E:w.CE}, D: {B:w.BD, C:w.CD, E:w.DE}, E: {C:w.CE, D:w.DE} };
      let minLen = Infinity;
      function dfs(node, len, visited) {
         if(node === 'E') { minLen = Math.min(minLen, len); return; }
         for(let n in graph[node]) { if(!visited.includes(n)) dfs(n, len + graph[node][n], [...visited, n]); }
      }
      dfs('A', 0, ['A']);
      const vars = { w, minLen };
      taskVariables.set(vars);
      correctAnswer.set(minLen);
      return vars;
    },
    html: (vars) => `
      <div class="space-y-6 animate-fade">
        <h3 class="font-medium text-zinc-800 text-lg">Задание 4: Маршруты</h3>
        <p class="text-sm text-zinc-500 font-light">Определите длину <b>самого короткого</b> пути между пунктами <b>A</b> и <b>E</b>.</p>
        <div class="overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-center text-sm font-mono border-collapse">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr><th class="p-2 border border-slate-200"></th><th class="p-2 border border-slate-200">A</th><th class="p-2 border border-slate-200">B</th><th class="p-2 border border-slate-200">C</th><th class="p-2 border border-slate-200">D</th><th class="p-2 border border-slate-200">E</th></tr>
            </thead>
            <tbody class="text-slate-700">
              <tr><th class="p-2 bg-slate-50 border border-slate-200">A</th><td class="p-2 border border-slate-200">-</td><td class="p-2 border border-slate-200">${vars.w.AB}</td><td class="p-2 border border-slate-200">${vars.w.AC}</td><td class="p-2 border border-slate-200">-</td><td class="p-2 border border-slate-200">-</td></tr>
              <tr><th class="p-2 bg-slate-50 border border-slate-200">B</th><td class="p-2 border border-slate-200">${vars.w.AB}</td><td class="p-2 border border-slate-200">-</td><td class="p-2 border border-slate-200">${vars.w.BC}</td><td class="p-2 border border-slate-200">${vars.w.BD}</td><td class="p-2 border border-slate-200">-</td></tr>
              <tr><th class="p-2 bg-slate-50 border border-slate-200">C</th><td class="p-2 border border-slate-200">${vars.w.AC}</td><td class="p-2 border border-slate-200">${vars.w.BC}</td><td class="p-2 border border-slate-200">-</td><td class="p-2 border border-slate-200">${vars.w.CD}</td><td class="p-2 border border-slate-200">${vars.w.CE}</td></tr>
              <tr><th class="p-2 bg-slate-50 border border-slate-200">D</th><td class="p-2 border border-slate-200">-</td><td class="p-2 border border-slate-200">${vars.w.BD}</td><td class="p-2 border border-slate-200">${vars.w.CD}</td><td class="p-2 border border-slate-200">-</td><td class="p-2 border border-slate-200">${vars.w.DE}</td></tr>
              <tr><th class="p-2 bg-slate-50 border border-slate-200">E</th><td class="p-2 border border-slate-200">-</td><td class="p-2 border border-slate-200">-</td><td class="p-2 border border-slate-200">${vars.w.CE}</td><td class="p-2 border border-slate-200">${vars.w.DE}</td><td class="p-2 border border-slate-200">-</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `,
    check: (answer, vars) => parseInt(answer) === vars.minLen
  },
  5: {
    init: (id) => {
        const op2_type = getRandomBool() ? 'div' : 'mul';
        let b, A, start, end, seqArray;
        while(true) {
            b = getRandomInt(2, 9); A = getRandomInt(1, 9); start = getRandomInt(10, 59);
            seqArray = Array(5).fill(1); const pos2 = getRandomInt(1, 3); seqArray[pos2] = 2;
            let curr = start; let valid = true;
            for (let cmd of seqArray) {
                if (cmd === 1) curr += A;
                else {
                    if (op2_type === 'div') { if (curr % b !== 0) { valid = false; break; } curr /= b; }
                    else curr *= b;
                }
            }
            if (valid && curr > 0 && curr !== start) { end = curr; break; }
        }
        const op2_text = op2_type === 'div' ? 'раздели на b' : 'умножь на b';
        const vars = { A, b, start, end, seq: seqArray.join(''), op2_text };
        taskVariables.set(vars);
        correctAnswer.set(b);
        return vars;
    },
    html: (vars) => `
      <div class="space-y-6 animate-fade">
        <h3 class="font-medium text-zinc-800 text-lg">Задание 5: Анализ алгоритма</h3>
        <div class="p-5 bg-slate-100 border border-slate-200 rounded-2xl font-mono text-slate-700 shadow-inner space-y-2">
          <div><b class="text-indigo-600">1.</b> прибавь ${vars.A}</div>
          <div><b class="text-indigo-600">2.</b> ${vars.op2_text}</div>
        </div>
        <p class="text-sm text-zinc-500 font-light">Программа <b class="text-slate-800 bg-slate-200 px-1 rounded">${vars.seq}</b> переводит число <b class="text-slate-800">${vars.start}</b> в число <b class="text-slate-800">${vars.end}</b>. Определите натуральное <b>b ≥ 2</b>.</p>
      </div>
    `,
    check: (answer, vars) => parseInt(answer) === vars.b
  },
  6: {
    init: (id) => {
      const ops = ['or', 'and']; const signs = ['<', '>', '<=', '>='];
      const variant = getRandomElement(['basic', 'not', 'div']);
      const op = getRandomElement(ops); const signS = getRandomElement(signs); const signT = getRandomElement(signs);
      const A = getRandomInt(-5, 12); const B = getRandomInt(-5, 12);
      const pairs = []; let yesCount = 0; let noCount = 0;
      for (let i = 0; i < 9; i++) {
        const s = getRandomInt(-10, 20); const t = getRandomInt(-10, 20); pairs.push(`(${s}, ${t})`);
        let valS = s; let valT = t; if (variant === 'div') { valS = Math.floor(s / 2); valT = Math.floor(t / 2); }
        let condS = false; if (signS === '<') condS = valS < A; else if (signS === '>') condS = valS > A; else if (signS === '<=') condS = valS <= A; else if (signS === '>=') condS = valS >= A;
        let condT = false; if (signT === '<') condT = valT < B; else if (signT === '>') condT = valT > B; else if (signT === '<=') condT = valT <= B; else if (signT === '>=') condT = valT >= B;
        let isYes = op === 'or' ? (condS || condT) : (condS && condT); if (variant === 'not') isYes = !isYes;
        if (isYes) yesCount++; else noCount++;
      }
      const askFor = getRandomBool() ? 'YES' : 'NO';
      const targetCount = askFor === 'YES' ? yesCount : noCount;
      let code = (variant === 'div') ? `if s // 2 ${signS} ${A} ${op} t // 2 ${signT} ${B}:` : (variant === 'not' ? `if not(s ${signS} ${A} ${op} t ${signT} ${B}):` : `if s ${signS} ${A} ${op} t ${signT} ${B}:`);
      const vars = { code, pairs, askFor, targetCount };
      taskVariables.set(vars);
      correctAnswer.set(targetCount);
      return vars;
    },
    html: (vars) => `
      <div class="space-y-6 animate-fade">
        <h3 class="font-medium text-zinc-800 text-lg">Задание 6: Анализ программы</h3>
        <p class="text-sm text-zinc-500 font-light">Сколько было запусков, при которых программа напечатала <b class="text-slate-800">«${vars.askFor}»</b>?</p>
        <div class="bg-slate-800 p-5 rounded-2xl text-emerald-400 font-mono text-sm shadow-xl overflow-x-auto">
          <code>${vars.code}<br>&nbsp;&nbsp;print("YES")<br>else:<br>&nbsp;&nbsp;print("NO")</code>
        </div>
        <div class="p-4 bg-slate-100 border border-slate-200 rounded-2xl font-mono text-xs text-slate-600 text-center">${vars.pairs.join('; ')}</div>
      </div>
    `,
    check: (answer, vars) => parseInt(answer) === vars.targetCount
  },
  7: {
    init: (id) => {
      const protocols = ['http', 'https', 'ftp']; const domains = ['edu.ru', 'exam.net', 'test.org', 'school.com']; const files = ['index.htm', 'doc.pdf', 'image.jpg', 'archive.zip'];
      const p = getRandomElement(protocols); const d = getRandomElement(domains); const f = getRandomElement(files);
      const full = `${p}://${d}/${f}`;
      const vars = { parts: [p, d, f], full };
      taskVariables.set(vars);
      correctAnswer.set(full);
      return vars;
    },
    html: (vars) => {
        const pieces = shuffleArray(['://', '/', vars.parts[2], vars.parts[0], vars.parts[1]]);
        return `
          <div class="space-y-6 animate-fade">
            <h3 class="font-medium text-zinc-800 text-lg">Задание 7: Сборка URL</h3>
            <p class="text-sm text-zinc-500 font-light">Собери адрес: <span class="font-mono text-xs text-indigo-600 font-bold">${vars.full}</span></p>
            <div id="t7-res" class="min-h-[50px] bg-slate-100 border border-slate-200 p-4 rounded-xl font-mono text-slate-800 break-all text-center">...</div>
            <div class="flex flex-wrap gap-2 justify-center">
              ${pieces.map(p => `<button onclick="this.disabled=true; const res=document.getElementById('t7-res'); if(res.innerText==='...') res.innerText=''; res.innerText+=this.innerText;" class="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors shadow-sm">${p}</button>`).join('')}
              <button onclick="document.getElementById('t7-res').innerText='...'; document.querySelectorAll('.space-y-6 button').forEach(b => b.disabled=false);" class="px-3 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-sm">Сброс</button>
            </div>
          </div>
        `;
    },
    check: (answer, vars) => {
        const assembled = document.getElementById('t7-res')?.innerText;
        return assembled === vars.full;
    }
  },
  8: {
    init: (id) => {
      const words = [['Коты', 'Собаки'], ['Розы', 'Тюльпаны'], ['Чай', 'Кофе']]; const pair = getRandomElement(words);
      const A = getRandomInt(200, 599); const B = getRandomInt(200, 599); const Inter = Math.floor(Math.random() * 100) + 10; const Union = A + B - Inter;
      const types = [ { q: `${pair[0]} | ${pair[1]}`, ans: Union, table: [[pair[0], A], [pair[1], B], [`${pair[0]} & ${pair[1]}`, Inter]] }, { q: `${pair[0]} & ${pair[1]}`, ans: Inter, table: [[pair[0], A], [pair[1], B], [`${pair[0]} | ${pair[1]}`, Union]] } ];
      const sel = getRandomElement(types);
      const vars = { q: sel.q, ans: sel.ans, table: shuffleArray(sel.table) };
      taskVariables.set(vars);
      correctAnswer.set(sel.ans);
      return vars;
    },
    html: (vars) => `
      <div class="space-y-6 animate-fade">
        <h3 class="font-medium text-zinc-800 text-lg">Задание 8: Множества</h3>
        <p class="text-sm text-zinc-500 font-light">Определи количество страниц (в тыс.) по запросу <b>${vars.q}</b>.</p>
        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table class="w-full text-sm text-left border-collapse">
            <thead class="bg-slate-50 border-b border-slate-200"><tr><th class="p-3 font-medium border border-slate-200">Запрос</th><th class="p-3 font-medium text-right border border-slate-200">Найдено</th></tr></thead>
            <tbody class="text-slate-700">${vars.table.map(row => `<tr><td class="p-3 border border-slate-200">${row[0]}</td><td class="p-3 text-right border border-slate-200 font-mono">${row[1]}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    `,
    check: (answer, vars) => parseInt(answer) === vars.ans
  },
  9: {
    init: (id) => {
      const targetNode = getRandomElement(['G', 'H']); const baseEdges = [['A','B'], ['A','C'], ['B','D'], ['C','D'], ['C','E'], ['D','F'], ['E','F'], ['F','G']];
      const optionalEdges = [['A','D'], ['B','F'], ['E','G'], ['D','G'], ['F','H'], ['G','H']];
      let currentEdges = [...baseEdges]; optionalEdges.forEach(edge => { if (getRandomBool()) currentEdges.push(edge); });
      const specNode = getRandomElement(['B', 'C']); const reqType = getRandomInt(0, 2);
      let qText = ''; if(reqType === 1) qText = `, проходящих через город <b>${specNode}</b>`; if(reqType === 2) qText = `, <b>НЕ</b> проходящих через город <b>${specNode}</b>`;
      let graph = {}; currentEdges.forEach(e => { if(!graph[e[0]]) graph[e[0]] = []; graph[e[0]].push(e[1]); });
      let count = 0; function dfs(u, visited) {
         if (u === targetNode) { if (reqType === 1 && !visited.includes(specNode)) return; if (reqType === 2 && visited.includes(specNode)) return; count++; return; }
         for(let v of graph[u] || []) { if(!visited.includes(v)) dfs(v, [...visited, v]); }
      }
      dfs('A', ['A']);
      const vars = { targetNode, edges: currentEdges, qText, answer: count };
      taskVariables.set(vars);
      correctAnswer.set(count);
      return vars;
    },
    html: (vars) => `
      <div class="space-y-6 animate-fade">
        <h3 class="font-medium text-zinc-800 text-lg">Задание 9: Количество путей</h3>
        <p class="text-sm text-zinc-500 font-light">Сколько существует путей из города <b>A</b> в город <b>${vars.targetNode}</b>${vars.qText}?</p>
        <div class="p-4 bg-slate-100 border border-slate-200 rounded-2xl font-mono text-xs text-center text-slate-500">Граф: ${vars.edges.map(e => e.join('→')).join(', ')}</div>
      </div>
    `,
    check: (answer, vars) => parseInt(answer) === vars.answer
  },
  10: {
    init: (id) => {
      const val1 = getRandomInt(20, 59); const val2 = getRandomInt(20, 59); const val3 = getRandomInt(20, 59);
      const findMax = getRandomBool(); const target = findMax ? Math.max(val1, val2, val3) : Math.min(val1, val2, val3);
      const vars = { typeStr: findMax ? 'максимальное' : 'минимальное', target, n1: val1.toString(16).toUpperCase(), n2: val2.toString(8), n3: val3.toString(2) };
      taskVariables.set(vars);
      correctAnswer.set(target);
      return vars;
    },
    html: (vars) => `
      <div class="space-y-6 animate-fade">
        <h3 class="font-medium text-zinc-800 text-lg">Задание 10: Системы счисления</h3>
        <p class="text-sm text-zinc-500 font-light">Найдите <b>${vars.typeStr}</b> число и запишите его в десятичной системе.</p>
        <div class="flex items-center justify-around p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xl text-indigo-700 font-mono font-bold tracking-widest shadow-sm">
          <span>${vars.n1}<sub>16</sub></span> <span class="text-slate-300">|</span> <span>${vars.n2}<sub>8</sub></span> <span class="text-slate-300">|</span> <span>${vars.n3}<sub>2</sub></span>
        </div>
      </div>
    `,
    check: (answer, vars) => parseInt(answer) === vars.target
  },
  11: {
    init: (id) => {
      const targetWord = getRandomElement(["код", "байт", "цикл", "сеть", "данные"]); const count = getRandomInt(2, 5);
      let text = "Информатика — это наука, изучающая методы сбора и хранения информации. Основным элементом здесь является алгоритм.".split(' ');
      for(let i=0; i<count; i++) text.splice(getRandomInt(0, text.length-1), 0, targetWord);
      const vars = { target: targetWord, text: text.join(' '), count };
      taskVariables.set(vars);
      correctAnswer.set(count);
      return vars;
    },
    html: (vars) => `
      <div class="space-y-6 animate-fade">
        <h3 class="font-medium text-zinc-800 text-lg">Задание 11: Поиск</h3>
        <p class="text-sm text-zinc-500 font-light">Сколько раз встречается слово <b>«${vars.target}»</b> в тексте?</p>
        <div class="bg-slate-50 rounded-2xl border border-slate-200 p-5 font-serif text-sm text-slate-700 leading-relaxed max-h-[150px] overflow-y-auto shadow-inner">${vars.text}</div>
      </div>
    `,
    check: (answer, vars) => parseInt(answer) === vars.count
  },
  12: {
    init: (id) => {
      const names = ['doc', 'report', 'test', 'data']; const exts = ['pdf', 'txt', 'docx', 'jpg'];
      let files = []; for(let i=0; i<8; i++) files.push(`${getRandomElement(names)}${getRandomInt(1,99)}.${getRandomElement(exts)}`);
      const targetMask = `*.${files[0].split('.')[1].substring(0, 2)}*`;
      const regex = new RegExp('^.*\\.' + files[0].split('.')[1].substring(0, 2) + '.*$', 'i');
      let ans = 0; files.forEach(f => { if (regex.test(f)) ans++; });
      const vars = { files, targetMask, ans };
      taskVariables.set(vars);
      correctAnswer.set(ans);
      return vars;
    },
    html: (vars) => `
      <div class="space-y-6 animate-fade">
        <h3 class="font-medium text-zinc-800 text-lg">Задание 12: Маски файлов</h3>
        <p class="text-sm text-zinc-500 font-light">Сколько файлов удовлетворяют маске <b>${vars.targetMask}</b>?</p>
        <div class="bg-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-400 h-[120px] overflow-y-auto shadow-inner">
          ${vars.files.map((f, i) => `<div>${i+1}. ${f}</div>`).join('')}
        </div>
      </div>
    `,
    check: (answer, vars) => parseInt(answer) === vars.ans
  },
  13: {
    init: (id) => {
      const v = { text: "Байкал — самое глубокое озеро на планете. В нём обитает уникальная нерпа.", words: ["Байкал", "озеро", "нерпа"] };
      const shuffled = shuffleArray([...v.words]);
      const vars = { text: v.text, map: { bold: shuffled[0], underline: shuffled[1], italic: shuffled[2] } };
      taskVariables.set(vars);
      correctAnswer.set("Formatted");
      return vars;
    },
    html: (vars) => `
      <div class="space-y-6 animate-fade">
        <h3 class="font-medium text-zinc-800 text-lg">Задание 13.2: Редактор</h3>
        <p class="text-sm text-zinc-500 font-light">Сделайте <b>${vars.map.bold}</b> жирным, <b>${vars.map.underline}</b> подчеркнутым, а <b>${vars.map.italic}</b> курсивом.</p>
        <div id="t13-editor" contenteditable="true" class="p-5 border-2 border-dashed border-slate-200 rounded-2xl text-sm text-slate-700 outline-none bg-white min-h-[100px]">${vars.text}</div>
        <p class="text-[10px] text-zinc-400 italic">Используйте Ctrl+B, Ctrl+U, Ctrl+I для форматирования.</p>
      </div>
    `,
    check: (answer, vars) => {
        const html = document.getElementById('t13-editor')?.innerHTML || "";
        return html.includes('<b>') || html.includes('<strong>') || html.includes('<u>') || html.includes('<i>');
    }
  },
  14: {
    init: (id) => {
      const subjects = ['информатика', 'алгебра', 'физика'];
      const data = Array.from({length: 6}, () => ({ sub: getRandomElement(subjects), score: getRandomInt(2, 5), name: 'Ученик' }));
      const targetSub = getRandomElement(subjects);
      let q1Ans = 0; data.forEach(d => { if(d.sub === targetSub) q1Ans++; });
      const vars = { data, targetSub, q1Ans };
      taskVariables.set(vars);
      correctAnswer.set(q1Ans);
      return vars;
    },
    html: (vars) => `
      <div class="space-y-6 animate-fade">
        <h3 class="font-medium text-zinc-800 text-lg">Задание 14: Таблицы</h3>
        <p class="text-sm text-zinc-500 font-light">Сколько учеников любят предмет <b>${vars.targetSub}</b>?</p>
        <div class="rounded-xl border border-slate-200 overflow-hidden bg-white">
          <table class="w-full text-xs font-mono text-center">
            <thead class="bg-slate-50"><tr><th class="p-2 border border-slate-200">Предмет</th><th class="p-2 border border-slate-200">Балл</th></tr></thead>
            <tbody>${vars.data.map(r => `<tr><td class="p-2 border border-slate-200">${r.sub}</td><td class="p-2 border border-slate-200">${r.score}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    `,
    check: (answer, vars) => parseInt(answer) === vars.q1Ans
  },
  15: {
    init: (id) => {
      const vars = { w: 5, h: 5, startX: 0, startY: 0, finishX: 4, finishY: 4, targetCount: 1, wallCount: 2 };
      taskVariables.set(vars);
      correctAnswer.set("Robot Done");
      return vars;
    },
    html: (vars) => `
      <div class="space-y-6 animate-fade">
        <h3 class="font-medium text-zinc-800 text-lg">Задание 15: Робот</h3>
        <p class="text-sm text-zinc-500 font-light">Напишите алгоритм для перемещения Робота из (0,0) в (4,4).</p>
        <textarea id="t15-code" maxlength="2000" class="w-full h-[150px] bg-slate-800 text-emerald-400 font-mono text-sm p-4 rounded-2xl outline-none" placeholder="вправо\nвниз\n..."></textarea>
      </div>
    `,
    check: (answer, vars) => {
        const code = document.getElementById('t15-code')?.value.toLowerCase() || "";
        return code.includes('вправо') && code.includes('вниз');
    }
  },
  16: {
    init: (id) => {
      const vars = { start: getRandomInt(0, 5), stop: getRandomInt(10, 20) };
      taskVariables.set(vars);
      correctAnswer.set(vars.stop - 1);
      return vars;
    },
    html: (vars) => `
      <div class="space-y-6 animate-fade">
        <h3 class="font-medium text-zinc-800 text-lg">Задание 16: Цикл FOR</h3>
        <div class="bg-slate-800 p-5 rounded-2xl text-emerald-400 font-mono text-sm shadow-xl">
          <code>for i in range(${vars.start}, ${vars.stop}):<br>&nbsp;&nbsp;print(i)</code>
        </div>
        <p class="text-sm text-zinc-500 font-light">Какое <b>последнее</b> число выведет программа?</p>
      </div>
    `,
    check: (answer, vars) => parseInt(answer) === vars.stop - 1
  },
  17: {
    init: (id) => {
      const arr = Array.from({length: 5}, () => getRandomInt(10, 99));
      const idx = getRandomInt(0, 4);
      const vars = { arr, index: idx, target: arr[idx] };
      taskVariables.set(vars);
      correctAnswer.set(arr[idx]);
      return vars;
    },
    html: (vars) => `
      <div class="space-y-6 animate-fade">
        <h3 class="font-medium text-zinc-800 text-lg">Задание 17: Списки</h3>
        <div class="bg-slate-800 p-5 rounded-2xl text-emerald-400 font-mono text-sm">
          <code>arr = [${vars.arr.join(', ')}]<br>print(arr[${vars.index}])</code>
        </div>
        <p class="text-sm text-zinc-500 font-light">Что выведет программа?</p>
      </div>
    `,
    check: (answer, vars) => parseInt(answer) === vars.target
  },
  18: {
    init: (id) => {
      const a = getRandomInt(2, 5); const b = getRandomInt(1, 10); const x = getRandomInt(2, 6);
      const vars = { a, b, x, ans: x * a + b };
      taskVariables.set(vars);
      correctAnswer.set(vars.ans);
      return vars;
    },
    html: (vars) => `
      <div class="space-y-6 animate-fade">
        <h3 class="font-medium text-zinc-800 text-lg">Задание 18: Функции</h3>
        <div class="bg-slate-800 p-5 rounded-2xl text-emerald-400 font-mono text-sm">
          <code>def f(x): return x * ${vars.a} + ${vars.b}<br>print(f(${vars.x}))</code>
        </div>
        <p class="text-sm text-zinc-500 font-light">Что выведет программа?</p>
      </div>
    `,
    check: (answer, vars) => parseInt(answer) === vars.ans
  },
  19: {
    init: (id) => {
      const p = [getRandomInt(10, 200), getRandomInt(10, 200), getRandomInt(10, 200), getRandomInt(10, 200)];
      const vars = { p, full: p.join('.') };
      taskVariables.set(vars);
      correctAnswer.set(vars.full);
      return vars;
    },
    html: (vars) => `
      <div class="space-y-6 animate-fade">
        <h3 class="font-medium text-zinc-800 text-lg">Задание 19: IP-адреса</h3>
        <p class="text-sm text-zinc-500 font-light">Соберите адрес: <span class="font-mono text-indigo-600 font-bold">${vars.full}</span></p>
        <div id="t19-res" class="p-4 bg-slate-100 rounded-xl font-mono text-center text-lg">...</div>
        <div class="flex gap-2 justify-center">
            ${shuffleArray([vars.p[0]+'.', vars.p[1], '.'+vars.p[2], '.'+vars.p[3]]).map(b => `<button onclick="const r=document.getElementById('t19-res'); if(r.innerText==='...')r.innerText=''; r.innerText+=this.innerText;" class="px-3 py-2 border rounded bg-white text-sm">${b}</button>`).join('')}
        </div>
      </div>
    `,
    check: (answer, vars) => document.getElementById('t19-res')?.innerText === vars.full
  },
  20: {
    init: (id) => {
      const q = { q: 'Мозг компьютера (вычисления)', a: 'Процессор' };
      taskVariables.set(q);
      correctAnswer.set(q.a);
      return q;
    },
    html: (vars) => `
      <div class="space-y-6 animate-fade">
        <h3 class="font-medium text-zinc-800 text-lg">Задание 20: Устройство ПК</h3>
        <p class="text-sm text-zinc-500 font-light">Какое устройство отвечает за: <b>${vars.q}</b>?</p>
        <div class="grid grid-cols-2 gap-2">
            ${shuffleArray(['Процессор', 'ОЗУ', 'Блок питания', 'Кулер']).map(v => `<button onclick="window.t20_ans='${v}'; this.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('bg-indigo-100')); this.classList.add('bg-indigo-100');" class="p-3 border rounded text-xs transition-colors">${v}</button>`).join('')}
        </div>
      </div>
    `,
    check: (answer, vars) => window.t20_ans === vars.a
  }
};

export function loadTask(id) {
    if(renderers[id]) {
        renderers[id].init(id);
        currentTask.set(id);
    }
}
