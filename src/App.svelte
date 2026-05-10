<script>
    import AIChat from './lib/components/AIChat.svelte';
    import { loadTask, renderers } from './lib/tasks/taskGenerator.js';
    import { currentTask, taskVariables } from './lib/stores/taskStore.js';
    import { onMount } from 'svelte';

    onMount(() => {
        loadTask(1); // Default to task 1 for now
    });

    function selectTask(id) {
        loadTask(id);
    }
</script>

<main class="container mx-auto p-4 max-w-2xl min-h-screen">
    <header class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-indigo-600">OGE Bot Refactored</h1>
        <p class="text-gray-500">Тренажер ОГЭ по информатике</p>
    </header>

    <nav class="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {#each Object.keys(renderers) as id}
            <button 
                class="px-4 py-2 rounded-lg transition-colors whitespace-nowrap {$currentTask == id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                on:click={() => selectTask(id)}
            >
                Задача {id}
            </button>
        {/each}
    </nav>

    {#if $currentTask && renderers[$currentTask]}
        <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 animate-fade">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">Задание {$currentTask}</h2>
            <div class="task-content prose prose-indigo max-w-none">
                {@html renderers[$currentTask].html($taskVariables)}
            </div>
            
            <div class="mt-6 flex gap-3">
                <input 
                    type="text" 
                    placeholder="Ваш ответ" 
                    class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button class="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                    Проверить
                </button>
            </div>
        </section>
    {:else if $currentTask}
        <div class="p-8 text-center text-gray-500">
            Загрузка задачи { $currentTask }...
        </div>
    {/if}

    <section class="mt-12 pb-12">
        <h3 class="text-lg font-medium mb-4 text-gray-700 px-1">AI Наставник</h3>
        <AIChat />
    </section>
</main>

<style>
    /* Remove global body style here as it is in app.css */
</style>
