<script>
    import AIChat from './lib/components/AIChat.svelte';
    import { loadTask, renderers } from './lib/tasks/taskGenerator.js';
    import { currentTask, taskVariables } from './lib/stores/taskStore.js';
    import { onMount } from 'svelte';
    import { fade, slide } from 'svelte/transition';

    let userInput = "";
    let feedback = { message: "", type: "" };
    let currentTab = "tasks"; 

    onMount(() => {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.expand();
            window.Telegram.WebApp.ready();
        }
        loadTask(1);
    });

    function selectTask(id) {
        userInput = "";
        feedback = { message: "", type: "" };
        loadTask(id);
    }

    function checkAnswer() {
        const renderer = renderers[$currentTask];
        if (!renderer) return;

        const isCorrect = renderer.check(userInput, $taskVariables);
        if (isCorrect) {
            feedback = { message: "Верно", type: "success" };
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }
        } else {
            feedback = { message: "Попробуйте еще раз", type: "error" };
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
            }
        }
    }
</script>

<div class="min-h-screen flex flex-col max-w-2xl mx-auto">
    <!-- Clean Header -->
    <header class="px-6 pt-12 pb-8">
        <div class="flex justify-between items-end">
            <div>
                <h1 class="text-3xl font-bold tracking-tight">Экзамен</h1>
                <p class="text-gray-400 text-sm font-medium mt-1">Курс информатики 2026</p>
            </div>
            <div class="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                <button 
                    class="px-4 py-1.5 rounded-full text-xs font-semibold transition-all {currentTab === 'tasks' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-400'}"
                    on:click={() => currentTab = 'tasks'}
                >Задачи</button>
                <button 
                    class="px-4 py-1.5 rounded-full text-xs font-semibold transition-all {currentTab === 'chat' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-400'}"
                    on:click={() => currentTab = 'chat'}
                >ИИ</button>
            </div>
        </div>
    </header>

    <main class="flex-1 px-6 pb-24">
        {#if currentTab === 'tasks'}
            <!-- Minimal Task Scroller -->
            <div class="flex gap-4 overflow-x-auto pb-8 scrollbar-hide">
                {#each Object.keys(renderers) as id}
                    <button 
                        class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all {
                            $currentTask == id 
                            ? 'bg-black text-white dark:bg-white dark:text-black scale-110' 
                            : 'bg-gray-50 text-gray-400 dark:bg-gray-900'
                        }"
                        on:click={() => selectTask(id)}
                    >
                        {id}
                    </button>
                {/each}
            </div>

            {#if $currentTask && renderers[$currentTask]}
                <div in:fade={{ duration: 300 }} class="space-y-12">
                    <!-- Task Meta -->
                    <div class="flex items-center gap-4">
                        <span class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 dark:text-gray-600">Задание {$currentTask}</span>
                        <div class="h-[1px] flex-1 bg-gray-100 dark:bg-gray-800"></div>
                    </div>

                    <!-- Content -->
                    <div class="task-content prose prose-zinc max-w-none text-xl leading-relaxed font-light text-gray-800 dark:text-gray-200">
                        {@html renderers[$currentTask].html($taskVariables)}
                    </div>
                    
                    <!-- Input -->
                    <div class="pt-8 border-t border-gray-100 dark:border-gray-800">
                        <input 
                            type="text" 
                            bind:value={userInput}
                            placeholder="Ваш ответ" 
                            class="canvas-input"
                            on:keydown={(e) => e.key === 'Enter' && checkAnswer()}
                        />
                        
                        <div class="flex items-center justify-between mt-4">
                            <button 
                                class="text-sm font-bold tracking-tight hover:opacity-70 transition-opacity"
                                on:click={checkAnswer}
                            >
                                ПРОВЕРИТЬ →
                            </button>

                            {#if feedback.message}
                                <span 
                                    transition:slide
                                    class="text-xs font-bold uppercase tracking-widest {feedback.type === 'success' ? 'text-green-500' : 'text-red-500'}"
                                >
                                    {feedback.message}
                                </span>
                            {/if}
                        </div>
                    </div>
                </div>
            {/if}
            
        {:else if currentTab === 'chat'}
            <div in:fade class="h-full">
                <AIChat />
            </div>
        {/if}
    </main>
</div>

<style>
    /* Ultra-clean reset */
    :global(.prose b) { font-weight: 700; color: var(--canvas-accent); }
    :global(.prose table) { width: 100%; border-collapse: separate; border-spacing: 0 4px; margin: 2rem 0; }
    :global(.prose td) { padding: 1rem 0; border-bottom: 1px solid var(--tg-theme-secondary-bg-color, #f0f0f0); font-family: monospace; font-size: 0.9rem; }
    :global(.prose th) { text-align: left; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #999; padding-bottom: 0.5rem; }
    :global(.prose code) { @apply bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded text-sm font-mono; }
</style>
