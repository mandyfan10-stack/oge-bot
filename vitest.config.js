import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: false })],
  resolve: {
    // Without these conditions vitest pulls Svelte's SSR build, where
    // onMount is a no-op — task setupTask() would never run.
    conditions: ['browser', 'svelte', 'development'],
  },
  test: {
    environment: 'jsdom',
    globals: false,
  },
});
