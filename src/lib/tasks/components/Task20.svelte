<script>
  import { setupTask } from '../taskSetup.js';
  import { getRandomElement, shuffleArray } from '../utils.js';

  const BANK = [
    { q: 'Мозг компьютера (вычисления)',          a: 'Процессор',         d: ['ОЗУ', 'Блок питания', 'Кулер'] },
    { q: 'Энергозависимая оперативная память',    a: 'ОЗУ',                d: ['Жёсткий диск', 'BIOS', 'Кэш CPU'] },
    { q: 'Постоянная память для долгого хранения данных', a: 'Жёсткий диск', d: ['ОЗУ', 'Регистры', 'Кэш L1'] },
    { q: 'Устройство вывода изображения',         a: 'Монитор',            d: ['Сканер', 'Микрофон', 'Принтер'] },
    { q: 'Устройство ввода текста',               a: 'Клавиатура',         d: ['Монитор', 'Принтер', 'Колонки'] },
    { q: 'Устройство для печати на бумаге',       a: 'Принтер',            d: ['Сканер', 'Проектор', 'Монитор'] },
    { q: 'Соединяет компоненты системного блока', a: 'Материнская плата',  d: ['Корпус', 'Блок питания', 'Радиатор'] },
    { q: 'Подаёт электропитание на компоненты',   a: 'Блок питания',       d: ['Процессор', 'Материнская плата', 'SSD'] },
    { q: 'Сканирование бумажных документов',      a: 'Сканер',             d: ['Принтер', 'Веб-камера', 'Плоттер'] },
    { q: 'Устройство ввода звука',                a: 'Микрофон',           d: ['Динамики', 'Наушники', 'Колонки'] },
  ];

  let options = [];
  let selectedAnswer = null;
  let correctAns = '';

  const vars = setupTask(() => {
    const item = getRandomElement(BANK);
    correctAns = item.a;
    options = shuffleArray([item.a, ...item.d]);
    selectedAnswer = null;
    return {
      vars: { q: item.q, a: item.a },
      answer: item.a,
      solution: `Ответ: <b>${item.a}</b>.`,
      hideFromChat: ['a'],
    };
  });

  export function check() {
    return selectedAnswer === correctAns;
  }
</script>

{#if $vars}
<div>
  <p class="vk-row-sub" style="margin-bottom: 8px;">Какое устройство отвечает за: <b>{$vars.q}</b>?</p>
  <div class="vk-task-options">
    {#each options as opt}
      <button
        class="vk-task-option"
        class:is-selected={selectedAnswer === opt}
        on:click={() => selectedAnswer = opt}
      >{opt}</button>
    {/each}
  </div>
</div>
{/if}
