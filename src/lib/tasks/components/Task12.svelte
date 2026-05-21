<script>
  import { setupTask } from '../taskSetup.js';
  import { getRandomInt, getRandomElement } from '../utils.js';

  const vars = setupTask(() => {
    const names = ['doc', 'report', 'test', 'data'];
    const exts = ['pdf', 'txt', 'docx', 'jpg'];
    let files = [];
    for (let i = 0; i < 8; i++) files.push(`${getRandomElement(names)}${getRandomInt(1, 99)}.${getRandomElement(exts)}`);
    const prefix = files[0].split('.')[1].substring(0, 2);
    const targetMask = `*.${prefix}*`;
    const regex = new RegExp('^.*\\.' + prefix + '.*$', 'i');
    let ans = 0;
    files.forEach(f => { if (regex.test(f)) ans++; });
    return {
      vars: { files, targetMask, ans },
      answer: String(ans),
      solution: `Маска <b>${targetMask}</b> — файл с расширением, начинающимся на «${prefix}». Подходящих файлов: <b>${ans}</b>.`,
    };
  });

  export function check(answer) {
    return !!$vars && parseInt(answer) === $vars.ans;
  }
</script>

{#if $vars}
<div>
  <p class="vk-row-sub" style="margin-bottom: 8px;">Сколько файлов удовлетворяют маске <b>{$vars.targetMask}</b>?</p>
  <div class="vk-task-filelist">
    {#each $vars.files as f, i}
      <div>{i + 1}. {f}</div>
    {/each}
  </div>
</div>
{/if}
