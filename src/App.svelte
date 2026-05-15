<script>
    import AIChat from './lib/components/AIChat.svelte';
    import { currentTask, taskVariables, correctAnswer } from './lib/stores/taskStore.js';
    import { onMount, tick, afterUpdate } from 'svelte';
    import { fade, slide } from 'svelte/transition';

    import Task1 from './lib/tasks/components/Task1.svelte';
    import Task2 from './lib/tasks/components/Task2.svelte';
    import Task3 from './lib/tasks/components/Task3.svelte';
    import Task4 from './lib/tasks/components/Task4.svelte';
    import Task5 from './lib/tasks/components/Task5.svelte';
    import Task6 from './lib/tasks/components/Task6.svelte';
    import Task7 from './lib/tasks/components/Task7.svelte';
    import Task8 from './lib/tasks/components/Task8.svelte';
    import Task9 from './lib/tasks/components/Task9.svelte';
    import Task10 from './lib/tasks/components/Task10.svelte';
    import Task11 from './lib/tasks/components/Task11.svelte';
    import Task12 from './lib/tasks/components/Task12.svelte';
    import Task13 from './lib/tasks/components/Task13.svelte';
    import Task14 from './lib/tasks/components/Task14.svelte';
    import Task15 from './lib/tasks/components/Task15.svelte';
    import Task16 from './lib/tasks/components/Task16.svelte';
    import Task17 from './lib/tasks/components/Task17.svelte';
    import Task18 from './lib/tasks/components/Task18.svelte';
    import Task19 from './lib/tasks/components/Task19.svelte';
    import Task20 from './lib/tasks/components/Task20.svelte';

    const components = {
        "1": Task1, "2": Task2, "3": Task3, "4": Task4, "5": Task5,
        "6": Task6, "7": Task7, "8": Task8, "9": Task9, "10": Task10,
        "11": Task11, "12": Task12, "13": Task13, "14": Task14, "15": Task15,
        "16": Task16, "17": Task17, "18": Task18, "19": Task19, "20": Task20
    };

    const taskIds = Object.keys(components);

    let userInput = "";
    let feedback = { message: "", type: "" };
    let currentTab = "tasks"; 
    let taskComponentRef;

    onMount(() => {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.expand();
            window.Telegram.WebApp.ready();
        }
        currentTask.set("1");
    });

    afterUpdate(() => {
        if (window.lucide?.createIcons) {
            window.lucide.createIcons();
        }
    });

    async function selectTask(id) {
        userInput = "";
        feedback = { message: "", type: "" };
        currentTask.set(id.toString());
        await tick();
    }

    function checkAnswer() {
        if (!taskComponentRef || typeof taskComponentRef.check !== 'function') return;

        const isCorrect = taskComponentRef.check(userInput);
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
                {#each taskIds as id}
                    <button 
                        class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all {
                            $currentTask === id 
                            ? 'bg-black text-white dark:bg-white dark:text-black scale-110' 
                            : 'bg-gray-50 text-gray-400 dark:bg-gray-900'
                        }"
                        on:click={() => selectTask(id)}
                    >
                        {id}
                    </button>
                {/each}
            </div>

            {#if $currentTask && components[$currentTask]}
                <div in:fade={{ duration: 300 }} class="space-y-12">
                    <!-- Task Meta -->
                    <div class="flex items-center gap-4">
                        <span class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 dark:text-gray-600">Задание {$currentTask}</span>
                        <div class="h-[1px] flex-1 bg-gray-100 dark:bg-gray-800"></div>
                    </div>

                    <!-- Content -->
                    <div class="task-content prose prose-zinc max-w-none text-xl leading-relaxed font-light text-gray-800 dark:text-gray-200">
                        <svelte:component this={components[$currentTask]} bind:this={taskComponentRef} />
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