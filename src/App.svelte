<script>
    import AIChat from './lib/components/AIChat.svelte';
    import { loadTask, renderers } from './lib/tasks/taskGenerator.js';
    import { currentTask, taskVariables, correctAnswer } from './lib/stores/taskStore.js';
    import { onMount } from 'svelte';
    import { fly, fade } from 'svelte/transition';

    let userInput = "";
    let feedback = { message: "", type: "" };
    let isMenuOpen = false;

    onMount(() => {
        loadTask(1);
    });

    function selectTask(id) {
        userInput = "";
        feedback = { message: "", type: "" };
        loadTask(id);
        isMenuOpen = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function checkAnswer() {
        const renderer = renderers[$currentTask];
        if (!renderer) return;

        const isCorrect = renderer.check(userInput, $taskVariables);
        if (isCorrect) {
            feedback = { message: "✨ Идеально! Это правильный ответ.", type: "success" };
        } else {
            feedback = { message: "🤔 Почти... Попробуй пересчитать или спроси совета у ИИ.", type: "error" };
        }
    }
</script>

<div class="min-h-screen mesh-gradient selection:bg-indigo-500/30">
    <!-- Mobile Header -->
    <header class="sticky top-0 z-50 glass-card border-b border-white/5 px-4 py-4 mb-6">
        <div class="max-w-2xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <span class="font-bold text-white text-xl">Ω</span>
                </div>
                <div>
                    <h1 class="font-bold text-white tracking-tight">OGE MASTER</h1>
                    <p class="text-[10px] text-indigo-400 font-medium tracking-widest uppercase">Expert System</p>
                </div>
            </div>
            <button 
                on:click={() => isMenuOpen = !isMenuOpen}
                class="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
                <div class="w-6 h-0.5 bg-white/60 mb-1.5 transition-all {isMenuOpen ? 'rotate-45 translate-y-2' : ''}"></div>
                <div class="w-6 h-0.5 bg-white/60 mb-1.5 transition-all {isMenuOpen ? 'opacity-0' : ''}"></div>
                <div class="w-4 h-0.5 bg-white/60 ml-auto transition-all {isMenuOpen ? '-rotate-45 -translate-y-2 w-6' : ''}"></div>
            </button>
        </div>
    </header>

    <main class="container mx-auto px-4 max-w-2xl pb-24">
        <!-- Task Selection Drawer -->
        {#if isMenuOpen}
            <div 
                transition:fly={{ y: -20, duration: 300 }}
                class="glass-card rounded-2xl p-4 mb-8 grid grid-cols-5 gap-2 border border-indigo-500/10 shadow-indigo-500/5"
            >
                {#each Object.keys(renderers) as id}
                    <button 
                        class="aspect-square flex items-center justify-center rounded-xl text-xs font-semibold transition-all {$currentTask == id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}"
                        on:click={() => selectTask(id)}
                    >
                        {id}
                    </button>
                {/each}
            </div>
        {/if}

        {#if $currentTask && renderers[$currentTask]}
            <section 
                in:fade={{ duration: 400 }}
                class="glass-card rounded-[2.5rem] p-8 mb-10 relative overflow-hidden"
            >
                <!-- Task Badge -->
                <div class="absolute top-0 right-0 p-8">
                    <span class="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold tracking-widest uppercase">
                        Unit {$currentTask}
                    </span>
                </div>

                <div class="mb-10">
                    <h2 class="text-2xl font-bold text-white mb-2 leading-tight">Задание {$currentTask}</h2>
                    <div class="h-1 w-12 bg-indigo-500 rounded-full"></div>
                </div>

                <div class="task-content prose prose-invert max-w-none mb-10 text-slate-300 leading-relaxed font-light">
                    {@html renderers[$currentTask].html($taskVariables)}
                </div>
                
                <div class="space-y-6">
                    <div class="relative group">
                        <input 
                            type="text" 
                            bind:value={userInput}
                            placeholder="Введите ваш ответ..." 
                            class="w-full bg-slate-950/50 border border-white/10 px-6 py-5 rounded-2xl text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all font-mono text-lg"
                            on:keydown={(e) => e.key === 'Enter' && checkAnswer()}
                        />
                        <button 
                            class="absolute right-3 top-3 bottom-3 bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                            on:click={checkAnswer}
                        >
                            ПРОВЕРИТЬ
                        </button>
                    </div>

                    {#if feedback.message}
                        <div 
                            transition:fly={{ y: 10, duration: 300 }}
                            class="p-5 rounded-2xl text-sm font-semibold flex items-center gap-3 border {feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}"
                        >
                            <span class="text-xl">{feedback.type === 'success' ? '✓' : '✕'}</span>
                            {feedback.message}
                        </div>
                    {/if}
                </div>
            </section>
        {/if}

        <!-- AI Assistant Section -->
        <section class="mt-20">
            <div class="flex items-center gap-3 mb-6 px-2">
                <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
                <h3 class="text-lg font-bold text-white tracking-tight">AI Наставник</h3>
            </div>
            <AIChat />
        </section>
    </main>
</div>

<style>
    :global(.prose b) { @apply text-indigo-400 font-bold; }
    :global(.prose table) { @apply w-full border-collapse my-4 rounded-xl overflow-hidden border border-white/5; }
    :global(.prose th) { @apply bg-white/5 p-3 text-slate-400 font-medium text-xs uppercase tracking-wider; }
    :global(.prose td) { @apply p-3 border-t border-white/5 text-slate-300 font-mono text-sm; }
    :global(.prose code) { @apply bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-sm border border-indigo-500/20; }
</style>
