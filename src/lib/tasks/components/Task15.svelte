<script>
  import { onMount } from 'svelte';
  import { taskVariables, correctAnswer } from '../../stores/taskStore.js';
  import { getRandomInt, getRandomBool, shuffleArray, getRandomElement } from '../utils.js';

  let vars = null;
  let robotCode = "";
  let errorMsg = "";
  let successMsg = "";
  let isRunning = false;

  let robot = { x: 0, y: 0, painted: new Set() };
  let visualStep = 0;

  $: horizontalSet = vars ? new Set(vars.horizontals.map(w => `${w.x},${w.y}`)) : new Set();
  $: verticalSet = vars ? new Set(vars.verticals.map(w => `${w.x},${w.y}`)) : new Set();

  onMount(() => {
    const w = 10;
    const h = 10;
    const key = (x, y) => `${x},${y}`;
    const fromKey = (value) => {
      const [x, y] = value.split(',').map(Number);
      return { x, y };
    };

    const hasWallInSet = (hWalls, vWalls, x, y, dir) => {
      if (x < 0 || x >= w || y < 0 || y >= h) return true;
      if (dir === 'up') return y === 0 || hWalls.has(key(x, y - 1));
      if (dir === 'down') return y === h - 1 || hWalls.has(key(x, y));
      if (dir === 'left') return x === 0 || vWalls.has(key(x - 1, y));
      if (dir === 'right') return x === w - 1 || vWalls.has(key(x, y));
      return false;
    };

    const getReachability = (start, hWalls, vWalls) => {
      const queue = [{ ...start, dist: 0 }];
      const seen = new Map([[key(start.x, start.y), 0]]);
      const dirs = [
        { name: 'up', dx: 0, dy: -1 },
        { name: 'down', dx: 0, dy: 1 },
        { name: 'left', dx: -1, dy: 0 },
        { name: 'right', dx: 1, dy: 0 }
      ];

      while (queue.length) {
        const cur = queue.shift();
        dirs.forEach(dir => {
          if (hasWallInSet(hWalls, vWalls, cur.x, cur.y, dir.name)) return;
          const next = { x: cur.x + dir.dx, y: cur.y + dir.dy, dist: cur.dist + 1 };
          const nextKey = key(next.x, next.y);
          if (seen.has(nextKey)) return;
          seen.set(nextKey, next.dist);
          queue.push(next);
        });
      }

      return seen;
    };

    const addSegment = (wallSet, orientation) => {
      const length = getRandomInt(3, 7);
      const gapCount = length >= 5 && getRandomBool() ? 2 : 1;
      const gaps = new Set();
      while (gaps.size < gapCount) gaps.add(getRandomInt(1, length - 2));

      if (orientation === 'horizontal') {
        const y = getRandomInt(1, h - 2);
        const startX = getRandomInt(0, w - length);
        for (let offset = 0; offset < length; offset++) {
          if (!gaps.has(offset)) wallSet.add(key(startX + offset, y));
        }
        return;
      }

      const x = getRandomInt(1, w - 2);
      const startY = getRandomInt(0, h - length);
      for (let offset = 0; offset < length; offset++) {
        if (!gaps.has(offset)) wallSet.add(key(x, startY + offset));
      }
    };

    let newVars = null;

    for (let attempt = 0; attempt < 80; attempt++) {
      const horizontalSet = new Set();
      const verticalSet = new Set();
      const horizontalSegments = getRandomInt(3, 5);
      const verticalSegments = getRandomInt(3, 5);

      for (let i = 0; i < horizontalSegments; i++) addSegment(horizontalSet, 'horizontal');
      for (let i = 0; i < verticalSegments; i++) addSegment(verticalSet, 'vertical');

      if (getRandomBool()) addSegment(horizontalSet, 'horizontal');
      if (getRandomBool()) addSegment(verticalSet, 'vertical');

      const targetSet = new Set();
      horizontalSet.forEach(wall => {
        const { x, y } = fromKey(wall);
        if (y + 1 < h) targetSet.add(key(x, y + 1));
      });
      verticalSet.forEach(wall => {
        const { x, y } = fromKey(wall);
        targetSet.add(key(x, y));
      });

      if (targetSet.size < 10 || targetSet.size > 24) continue;

      const allCells = [];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (!targetSet.has(key(x, y))) allCells.push({ x, y });
        }
      }

      const startCandidates = shuffleArray(allCells);
      for (const start of startCandidates) {
        const reach = getReachability(start, horizontalSet, verticalSet);
        const targetDistances = [...targetSet].map(target => reach.get(target)).filter(Number.isFinite);
        if (targetDistances.length !== targetSet.size) continue;
        const maxDistance = Math.max(...targetDistances);
        const totalDistance = targetDistances.reduce((sum, value) => sum + value, 0);
        if (maxDistance < 7 || totalDistance < targetSet.size * 5) continue;

        const finishCandidates = [...reach.entries()]
          .filter(([cell, distance]) => !targetSet.has(cell) && cell !== key(start.x, start.y) && distance >= Math.max(6, Math.floor(maxDistance * 0.7)))
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);
        if (!finishCandidates.length) continue;
        const finish = fromKey(getRandomElement(finishCandidates)[0]);

        const horizontals = [...horizontalSet].map(fromKey).sort((a, b) => a.y - b.y || a.x - b.x);
        const verticals = [...verticalSet].map(fromKey).sort((a, b) => a.x - b.x || a.y - b.y);
        const targetPainted = [...targetSet].sort();
        
        newVars = {
          w, h,
          startX: start.x,
          startY: start.y,
          finishX: finish.x,
          finishY: finish.y,
          horizontals,
          verticals,
          targetPainted,
          targetCount: targetPainted.length,
          wallCount: horizontals.length + verticals.length
        };
        break;
      }
      if (newVars) break;
    }

    if (!newVars) {
      const horizontals = [
        {x: 1, y: 2}, {x: 2, y: 2}, {x: 4, y: 2}, {x: 5, y: 2}, {x: 6, y: 2},
        {x: 0, y: 5}, {x: 1, y: 5}, {x: 3, y: 5}, {x: 4, y: 5}, {x: 7, y: 6}
      ];
      const verticals = [
        {x: 6, y: 1}, {x: 6, y: 2}, {x: 6, y: 4}, {x: 6, y: 5}, {x: 2, y: 6},
        {x: 2, y: 7}, {x: 4, y: 0}, {x: 4, y: 1}, {x: 8, y: 7}, {x: 8, y: 8}
      ];
      const targetSet = new Set([
        ...horizontals.map(wall => key(wall.x, wall.y + 1)),
        ...verticals.map(wall => key(wall.x, wall.y))
      ]);
      const targetPainted = [...targetSet].sort();
      const reach = getReachability({ x: 0, y: 0 }, new Set(horizontals.map(wall => key(wall.x, wall.y))), new Set(verticals.map(wall => key(wall.x, wall.y))));
      const fallbackFinish = fromKey([...reach.entries()].filter(([cell]) => !targetSet.has(cell) && cell !== '0,0').sort((a, b) => b[1] - a[1])[0][0]);
      
      newVars = {
        w, h,
        startX: 0,
        startY: 0,
        finishX: fallbackFinish.x,
        finishY: fallbackFinish.y,
        horizontals,
        verticals,
        targetPainted,
        targetCount: targetPainted.length,
        wallCount: horizontals.length + verticals.length
      };
    }

    vars = newVars;
    robot = { x: vars.startX, y: vars.startY, painted: new Set() };
    taskVariables.set(vars);
    correctAnswer.set("Robot Done");
  });

  const hasWall = (x, y, dir) => {
      if (x < 0 || x >= vars.w || y < 0 || y >= vars.h) return true;
      if (dir === 'up') return horizontalSet.has(`${x},${y - 1}`);
      if (dir === 'down') return horizontalSet.has(`${x},${y}`);
      if (dir === 'left') return verticalSet.has(`${x - 1},${y}`);
      if (dir === 'right') return verticalSet.has(`${x},${y}`);
      return false;
  };

  const evaluateCondition = (rob, condStr) => {
      let expr = condStr.replace(/\(/g, '').replace(/\)/g, '').toLowerCase();

      try {
          const orParts = expr.split(' или ').map(orPart => {
              return orPart.split(' и ').map(cond => {
                  let isNot = false;
                  let str = cond.trim();
                  while (str.startsWith('не ')) {
                      isNot = !isNot;
                      str = str.substring(3).trim();
                  }
                  return { str, isNot };
              });
          });

          for (let i = 0; i < orParts.length; i++) {
              const andParts = orParts[i];
              let andResult = true;
              for (let j = 0; j < andParts.length; j++) {
                  const { str, isNot } = andParts[j];
                  let result = false;
                  if (str === 'сверху свободно') result = !hasWall(rob.x, rob.y, 'up');
                  else if (str === 'снизу свободно') result = !hasWall(rob.x, rob.y, 'down');
                  else if (str === 'слева свободно') result = !hasWall(rob.x, rob.y, 'left');
                  else if (str === 'справа свободно') result = !hasWall(rob.x, rob.y, 'right');
                  else if (str === 'сверху стена') result = hasWall(rob.x, rob.y, 'up');
                  else if (str === 'снизу стена') result = hasWall(rob.x, rob.y, 'down');
                  else if (str === 'слева стена') result = hasWall(rob.x, rob.y, 'left');
                  else if (str === 'справа стена') result = hasWall(rob.x, rob.y, 'right');
                  else throw new Error('Некорректное условие: ' + condStr);

                  if (isNot) result = !result;

                  andResult = andResult && result;
                  if (!andResult) break;
              }
              if (andResult) return true;
          }
          return false;
      } catch(e) {
          throw new Error('Некорректное условие: ' + condStr);
      }
  };

  const delay = ms => new Promise(res => setTimeout(res, ms));

  async function runRobot() {
    if (!vars) return;
    isRunning = true;
    errorMsg = "";
    successMsg = "";
    
    let lines = robotCode.split('\n').map(l => l.trim().toLowerCase()).filter(l => l);
    robot = { x: vars.startX, y: vars.startY, painted: new Set() };
    visualStep = 0;

    try {
        let i = 0, loopStack = [], iterations = 0, inIfSkip = false, ifDepth = 0;
        while(i < lines.length) {
            iterations++; if(iterations > 2000) throw new Error('Слишком много шагов! Возможно, бесконечный цикл.');
            let cmd = lines[i];
            if (cmd.includes('|')) cmd = cmd.split('|')[0].trim();
            if (!cmd || cmd === 'использовать робот' || cmd.startsWith('алг') || cmd === 'нач' || cmd === 'кон') { i++; continue; }

            if (inIfSkip) {
                if (cmd.startsWith('если')) ifDepth++;
                if (cmd === 'все') { ifDepth--; if (ifDepth === 0) inIfSkip = false; }
                else if (cmd === 'иначе' && ifDepth === 1) inIfSkip = false; 
                i++; continue;
            }

            if (cmd === 'вверх') { if(hasWall(robot.x, robot.y, 'up')) throw new Error('Робот разбился о стену сверху!'); robot.y--; }
            else if (cmd === 'вниз') { if(hasWall(robot.x, robot.y, 'down')) throw new Error('Робот разбился о стену снизу!'); robot.y++; }
            else if (cmd === 'влево') { if(hasWall(robot.x, robot.y, 'left')) throw new Error('Робот разбился о стену слева!'); robot.x--; }
            else if (cmd === 'вправо') { if(hasWall(robot.x, robot.y, 'right')) throw new Error('Робот разбился о стену справа!'); robot.x++; }
            else if (cmd === 'закрасить') { robot.painted.add(`${robot.x},${robot.y}`); robot.painted = new Set(robot.painted); }
            else if (cmd.startsWith('если')) {
                let cond = cmd.substring(4).replace(' то', '').trim();
                if (!evaluateCondition(robot, cond)) { inIfSkip = true; ifDepth = 1; }
            }
            else if (cmd === 'иначе') { inIfSkip = true; ifDepth = 1; }
            else if (cmd === 'все') { /* пустой блок */ }
            else if (cmd.startsWith('нц пока')) {
                let cond = cmd.substring(7).trim();
                if (!evaluateCondition(robot, cond)) {
                    let depth = 1;
                    while(depth > 0 && i < lines.length - 1) {
                        i++; let peekCmd = lines[i].split('|')[0].trim();
                        if(peekCmd.startsWith('нц пока')) depth++; else if(peekCmd === 'кц') depth--;
                    }
                    if(depth > 0) throw new Error('Нет парного "кц" для "нц пока"');
                } else loopStack.push({ start: i, cond: cond });
            }
            else if (cmd === 'кц') {
                if(loopStack.length > 0) {
                    let loop = loopStack[loopStack.length - 1];
                    if(evaluateCondition(robot, loop.cond)) i = loop.start; else loopStack.pop();
                } else throw new Error('Лишний "кц" без "нц пока"');
            }
            else throw new Error('Неизвестная команда: ' + cmd);

            visualStep++;
            robot = { ...robot }; // trigger reactivity
            await delay(60);
            i++;
        }

        robot = { ...robot };
        let success = true;
        if(robot.painted.size !== vars.targetPainted.length) success = false;
        for(let p of vars.targetPainted) { if(!robot.painted.has(p)) success = false; }
        const reachedFinish = robot.x === vars.finishX && robot.y === vars.finishY;
        if (!reachedFinish) success = false;

        if (success) successMsg = "Идеально! Алгоритм закрасил все нужные клетки и привёл Робота в точку Ф.";
        else errorMsg = "Алгоритм завершился неверно: проверь закрашенные клетки и убедись, что Робот остановился в зелёной точке Ф. Проходы закрашивать нельзя!";
    } catch(err) { errorMsg = err.message; }
    isRunning = false;
  }

  export function check() {
    return successMsg !== "";
  }

  function resetRobot() {
    errorMsg = "";
    successMsg = "";
    robot = { x: vars.startX, y: vars.startY, painted: new Set() };
  }
</script>

{#if vars}
<div class="p-6 rounded-[2rem] space-y-6 bg-slate-900 border border-slate-700 shadow-xl animate-fade">
  <div>
    <h3 class="font-medium text-slate-100 text-lg">Задание 15: Робот</h3>
    <p class="text-xs text-slate-400 font-light mt-1">
      Напиши алгоритм для Робота. Закрась все клетки, расположенные <span class="text-white">непосредственно ниже горизонтальной стены и левее вертикальной</span>. Проходы должны остаться незакрашенными. После закраски приведи Робота в зелёную клетку <span class="text-emerald-400 font-semibold">Ф</span>.
      <br><br><span class="text-blue-400 font-medium">Структура:</span> использовать Робот, алг, нач, кон, | комментарии
      <br><span class="text-blue-400 font-medium">Команды:</span> вверх, вниз, влево, вправо, закрасить
      <br><span class="text-blue-400 font-medium">Ветвление:</span> если [усл] то ... иначе ... все
      <br><span class="text-blue-400 font-medium">Цикл:</span> <span class="font-mono bg-white/10 px-1 rounded text-slate-300">нц пока [усл] ... кц</span>
      <br><span class="text-blue-400 font-medium">Условия:</span> сверху/снизу/слева/справа <span class="text-white">свободно/стена</span>
    </p>
  </div>
  
  <div class="flex flex-col md:flex-row gap-4">
    <textarea bind:value={robotCode} on:input={() => { errorMsg = ''; successMsg = ''; }} class="flex-1 w-full min-h-[250px] bg-slate-950/50 border border-slate-700 rounded-2xl p-4 text-sm font-mono text-slate-300 outline-none focus:border-blue-500/50 resize-y leading-relaxed" spellcheck="false" placeholder="использовать Робот\nалг\nнач\n  нц пока не сверху свободно\n    закрасить\n    вправо\n  кц\nкон"></textarea>
    
    <div class="w-full md:w-1/2 max-w-[320px] mx-auto aspect-square flex-shrink-0 relative">
      <div class="grid grid-cols-10 gap-0 w-full h-full p-2 bg-slate-800 rounded-xl border border-slate-700 shadow-inner">
        {#each Array(vars.h) as _, y}
          {#each Array(vars.w) as _, x}
            {@const isPainted = robot.painted.has(`${x},${y}`)}
            {@const hasTop = horizontalSet.has(`${x},${y - 1}`)}
            {@const hasBottom = horizontalSet.has(`${x},${y}`)}
            {@const hasLeft = verticalSet.has(`${x - 1},${y}`)}
            {@const hasRight = verticalSet.has(`${x},${y}`)}
            {@const isRobot = robot.x === x && robot.y === y}
            {@const isFinish = vars.finishX === x && vars.finishY === y}
            
            <div class="relative border-slate-700/50 transition-colors duration-150 border aspect-square {isPainted ? 'bg-blue-500/40' : 'bg-black/20'}
              {hasTop ? '!border-t-[3px] !border-t-orange-400' : ''}
              {hasBottom ? '!border-b-[3px] !border-b-orange-400' : ''}
              {hasLeft ? '!border-l-[3px] !border-l-orange-400' : ''}
              {hasRight ? '!border-r-[3px] !border-r-orange-400' : ''}
            ">
              {#if isRobot}
                <div class="absolute inset-[2px] bg-blue-400 rounded-sm flex items-center justify-center text-[10px] shadow-[0_0_10px_rgba(96,165,250,0.8)] z-10 font-bold text-white">Р</div>
              {:else if isFinish}
                <div class="absolute inset-[5px] rounded-sm border border-emerald-400/80 bg-emerald-500/25 flex items-center justify-center text-[9px] font-bold text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.45)] z-0">Ф</div>
              {/if}
            </div>
          {/each}
        {/each}
      </div>
    </div>
  </div>
  
  {#if errorMsg}
    <div class="p-4 rounded-2xl border bg-rose-500/10 border-rose-500/20 text-sm font-medium text-rose-400">{errorMsg}</div>
  {/if}
  {#if successMsg}
    <div class="p-4 rounded-2xl border bg-emerald-500/10 border-emerald-500/20 text-sm font-medium text-emerald-400">{successMsg}</div>
  {/if}
  
  <div class="flex gap-2">
      <button on:click={resetRobot} class="p-4 rounded-xl text-slate-400 hover:bg-slate-800 transition-colors border border-slate-700">
        Сбросить
      </button>
      <button on:click={runRobot} disabled={isRunning} class="flex-1 py-4 rounded-xl bg-blue-600 text-white font-medium shadow-lg hover:bg-blue-500 transition-colors disabled:opacity-50">
        Запустить алгоритм
      </button>
  </div>
</div>
{/if}