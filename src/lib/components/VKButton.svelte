<script>
  /** @type {'primary' | 'secondary'} */
  export let variant = 'primary';
  /** @type {'button' | 'submit'} */
  export let type = 'button';
  export let disabled = false;
</script>

<button
  {type}
  {disabled}
  class={variant === 'secondary' ? 'vk-button-secondary' : 'vk-button'}
  on:click
>
  <slot />
</button>
