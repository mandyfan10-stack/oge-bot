<script>
    import AIChat from './lib/components/AIChat.svelte';
    import { loadTask, renderers } from './lib/tasks/taskGenerator.js';
    import { currentTask, taskVariables } from './lib/stores/taskStore.js';
    import { onMount } from 'svelte';
    import { quintOut } from 'svelte/easing';
    import { fade, fly } from 'svelte/transition';

    let userInput = "";
    let feedback = { message: "", type: "" };
    let currentTab = "tasks"; 

    onMount(() => {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.expand();
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.headerColor = '#000000';
            window.Telegram.WebApp.backgroundColor = '#000000';
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

    function premiumFly(node, { duration = 400 }) {
        return {
            duration,
            css: t => {
                const eased = quintOut(t);
                return `
                    transform: translateY(${(1 - eased) * 20}px) scale(${0.95 + (eased * 0.05)});
                    opacity: ${eased};
                `;
            }
        };
    }
</script>

<div class="relative min-h-screen flex flex-col max-w-2xl mx-auto selection:bg-blue-500/30">
    <!-- Ethereal Glows -->
    <div class="ethereal-glow -top-[50vw] -left-[25vw]" style="background: radial-gradient(circle, rgba(0, 122, 255, 0.2) 0%, transparent 70%);"></div>
    <div class="ethereal-glow top-[30vh] -right-[50vw]" style="background: radial-gradient(circle, rgba(94, 92, 230, 0.15) 0%, transparent 70%);"></div>

    <!-- Premium Header -->
    <header class="px-8 pt-16 pb-12 shrink-0">
        <div class="flex justify-between items-center">
            <div class="space-y-1">
                <h1 class="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">Экзамен</h1>
                <div class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    <p class="mono-accent text-[10px] text-gray-500 uppercase tracking-[0.2em]">Curriculum 2026 v2.6</p>
                </div>
            </div>
            
            <nav class="flex premium-glass p-1 rounded-full border-white/5 shadow-2xl scale-110">
                <button 
                    class="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all {currentTab === 'tasks' ? 'bg-white text-black shadow-xl scale-105' : 'text-gray-500 hover:text-white'}"
                    on:click={() => currentTab = 'tasks'}
                >Задачи</button>
                <button 
                    class="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all {currentTab === 'chat' ? 'bg-white text-black shadow-xl scale-105' : 'text-gray-500 hover:text-white'}"
                    on:click={() => currentTab = 'chat'}
                >ИИ</button>
            </nav>
        </div>
    </header>

    <main class="flex-1 px-8 pb-32 overflow-y-auto scrollbar-hide">
        {#if currentTab === 'tasks'}
            <div class="space-y-12">
                <!-- Task Hub Scroller -->
                <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide py-2">
                    {#each Object.keys(renderers) as id}
                        <button 
                            class="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-black mono-accent transition-all duration-300 {
                                $currentTask == id 
                                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-110' 
                                : 'bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10'
                            }"
                            on:click={() => selectTask(id)}
                        >
                            {id.padStart(2, '0')}
                        </button>
                    {/each}
                </div>

                {#if $currentTask && renderers[$currentTask]}
                    <div in:premiumFly class="space-y-10">
                        <!-- Task Header -->
                        <div class="flex items-center gap-6">
                            <span class="mono-accent text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/80">Segment {$currentTask}</span>
                            <div class="h-[1px] flex-1 bg-gradient-to-r from-blue-500/30 to-transparent"></div>
                        </div>

                        <!-- Content Console -->
                        <div class="premium-glass p-8 rounded-[32px] border-white/10 shadow-3xl relative group">
                            <div class="absolute -inset-0.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-[32px] blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                            <div class="relative task-content prose prose-invert max-w-none text-xl leading-relaxed font-light">
                                {@html renderers[$currentTask].html($taskVariables)}
                            </div>
                        </div>
                        
                        <!-- Input Console -->
                        <div class="space-y-6 pt-6">
                            <div class="relative">
                                <input 
                                    type="text" 
                                    bind:value={userInput}
                                    placeholder="Введите ответ" 
                                    class="canvas-input !rounded-[24px] !bg-white/[0.03] !border-white/10 focus:!border-blue-500/50"
                                    on:keydown={(e) => e.key === 'Enter' && checkAnswer()}
                                />
                            </div>
                            
                            <div class="flex items-center justify-between">
                                <button 
                                    class="mono-accent text-[11px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all hover:tracking-[0.3em]"
                                    on:click={checkAnswer}
                                >
                                    Verify Input //
                                </button>

                                {#if feedback.message}
                                    <span 
                                        transition:fade
                                        class="text-[10px] font-black uppercase tracking-widest {feedback.type === 'success' ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'text-red-400'}"
                                    >
                                        {feedback.message}
                                    </span>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
            
        {:else if currentTab === 'chat'}
            <div in:premiumFly class="h-full">
                <AIChat />
            </div>
        {/if}
    </main>
</div>

<style>
    :global(.prose b) { font-weight: 700; color: #fff; text-shadow: 0 0 10px rgba(255,255,255,0.2); }
    :global(.prose table) { width: 100%; border-collapse: separate; border-spacing: 0 8px; margin: 2rem 0; }
    :global(.prose td) { padding: 1.25rem 1rem; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05); font-family: 'SF Mono', monospace; font-size: 0.85rem; }
    :global(.prose th) { text-align: left; font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: #555; padding: 0 1rem 0.5rem; }
    :global(.prose code) { @apply bg-white/5 px-2 py-1 rounded text-sm font-mono text-blue-300; }
</style>
