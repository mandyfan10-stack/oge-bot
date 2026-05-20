<script>
  /** @type {string | undefined} */
  export let title = undefined;
</script>

<section class="vk-panel">
  {#if title || $$slots.header}
    <div class="vk-panel-header">
      {#if $$slots.header}
        <slot name="header" />
      {:else}
        <span>{title}</span>
      {/if}
      {#if $$slots.actions}
        <span><slot name="actions" /></span>
      {/if}
    </div>
  {/if}
  <slot />
</section>
