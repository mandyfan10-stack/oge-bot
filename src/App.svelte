<script>
  let count = 0;
</script>

<main class="p-8 text-center">
  <h1 class="text-4xl font-bold text-indigo-600">OGE Bot</h1>
  <p class="mt-4">Svelte + Vite + Tailwind</p>
  <button 
    class="mt-6 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
    on:click={() => count++}
  >
    Count is {count}
  </button>
</main>
