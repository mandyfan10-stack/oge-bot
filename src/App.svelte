<script>
    import AIChat from './lib/components/AIChat.svelte';
    import { loadTask, renderers } from './lib/tasks/taskGenerator.js';
    import { currentTask, taskVariables, correctAnswer } from './lib/stores/taskStore.js';
    import { onMount } from 'svelte';

    let userInput = "";
    let feedback = { message: "", type: "" };
    let currentTab = "tasks"; // 'tasks' or 'chat'

    onMount(() => {
        // Expand Web App
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
            feedback = { message: "Правильный ответ!", type: "success" };
            // Optional: trigger haptic feedback
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }
        } else {
            feedback = { message: "Ответ неверный, попробуйте еще раз.", type: "error" };
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
            }
        }
    }
</script>

<div class="min-h-screen pb-[70px]">
    <main class="p-4 max-w-2xl mx-auto">
        {#if currentTab === 'tasks'}
            <!-- Header -->
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-tg-text">Тренажер ОГЭ</h1>
                <p class="text-sm text-tg-hint mt-1">Выберите задание для тренировки</p>
            </div>

            <!-- Task Selector (Horizontal Scroll) -->
            <div class="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {#each Object.keys(renderers) as id}
                    <button 
                        class="px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap {
                            $currentTask == id 
                            ? 'bg-tg-button text-tg-buttonText' 
                            : 'bg-tg-secondaryBg text-tg-text'
                        }"
                        on:click={() => selectTask(id)}
                    >
                        {id}
                    </button>
                {/each}
            </div>

            <!-- Task Content -->
            {#if $currentTask && renderers[$currentTask]}
                <div class="tg-card mb-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-lg font-bold text-tg-text">Задание {$currentTask}</h2>
                    </div>

                    <div class="task-content prose max-w-none text-tg-text mb-6 text-[15px] leading-relaxed">
                        {@html renderers[$currentTask].html($taskVariables)}
                    </div>
                    
                    <div class="space-y-3">
                        <input 
                            type="text" 
                            bind:value={userInput}
                            placeholder="Ваш ответ" 
                            class="tg-input"
                            on:keydown={(e) => e.key === 'Enter' && checkAnswer()}
                        />
                        <button class="tg-button w-full block" on:click={checkAnswer}>
                            Проверить
                        </button>
                    </div>

                    {#if feedback.message}
                        <div class="mt-4 p-3 rounded-xl text-sm font-medium text-center {feedback.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}">
                            {feedback.message}
                        </div>
                    {/if}
                </div>
            {:else}
                <div class="text-center text-tg-hint py-8">
                    Загрузка задачи...
                </div>
            {/if}
            
        {:else if currentTab === 'chat'}
            <div class="h-full">
                <AIChat />
            </div>
        {/if}
    </main>

    <!-- Bottom Tab Bar (Telegram Style) -->
    <div class="fixed bottom-0 left-0 right-0 h-[60px] bg-tg-bg border-t border-gray-200 dark:border-gray-800 flex justify-around items-center px-2 z-50">
        <button 
            class="flex flex-col items-center justify-center w-full h-full gap-1 {currentTab === 'tasks' ? 'text-tg-link' : 'text-tg-hint'}"
            on:click={() => currentTab = 'tasks'}
        >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            <span class="text-[10px] font-medium">Задачи</span>
        </button>
        <button 
            class="flex flex-col items-center justify-center w-full h-full gap-1 {currentTab === 'chat' ? 'text-tg-link' : 'text-tg-hint'}"
            on:click={() => currentTab = 'chat'}
        >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            <span class="text-[10px] font-medium">AI Наставник</span>
        </button>
    </div>
</div>

<style>
    /* Native-like resets for prose */
    :global(.prose b) { font-weight: 600; }
    :global(.prose table) { width: 100%; border-collapse: collapse; margin-top: 1rem; margin-bottom: 1rem; font-size: 0.875rem; }
    :global(.prose th, .prose td) { padding: 0.5rem; border: 1px solid var(--tg-theme-hint-color, #ccc); }
    :global(.prose code) { background-color: var(--tg-theme-secondary-bg-color, #f0f0f0); padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875em; }
</style>
