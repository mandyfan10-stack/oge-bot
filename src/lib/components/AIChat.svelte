<script>
    import { currentTask, taskVariables, correctAnswer } from '../stores/taskStore.js';
    import { tick } from 'svelte';
    import { fly, fade } from 'svelte/transition';

    let inputMessage = "";
    let chatHistory = [];
    let isTyping = false;
    let chatEnd;
    let inputRef;

    async function scrollToBottom() {
        await tick();
        chatEnd?.scrollIntoView({ behavior: 'smooth' });
    }

    function clearChat() {
        chatHistory = [];
        inputMessage = "";
        inputRef?.focus();
    }

    async function sendMessage() {
        if (!inputMessage.trim() || isTyping) return;
        
        const userMsg = inputMessage;
        inputMessage = "";
        
        let systemContext = `Task: ${$currentTask}|Vars: ${JSON.stringify($taskVariables)}|CorrectAns: ${$correctAnswer}`;
        
        // Push user message
        chatHistory = [...chatHistory, { role: "user", content: userMsg }];
        
        // Prepare a sliding window of the last 15 messages for history management
        const contextHistory = chatHistory.slice(-15);
        
        // Add empty assistant message immediately to accurately trigger the "Печатает..." typing indicator
        let aiMsg = { role: "assistant", content: "" };
        chatHistory = [...chatHistory, aiMsg];
        
        isTyping = true;
        scrollToBottom();

        try {
            const response = await fetch("https://oge-backend.onrender.com/api/chat", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "X-Telegram-Init-Data": window.Telegram?.WebApp?.initData || ""
                },
                body: JSON.stringify({
                    history: [{ role: "system", content: systemContext }, ...contextHistory],
                    text: userMsg
                })
            });

            if (!response.ok) {
                let errorMessage = "Ошибка связи.";
                if (response.status === 429 || response.status === 503 || response.status >= 400) {
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.reply || errorData.message || errorData.error || errorMessage;
                    } catch (e) {
                        // Fallback
                    }
                }
                throw new Error(errorMessage);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                aiMsg.content += decoder.decode(value, { stream: true });
                chatHistory = [...chatHistory]; 
                scrollToBottom();
            }
            
            const finalChunk = decoder.decode();
            if (finalChunk) {
                aiMsg.content += finalChunk;
                chatHistory = [...chatHistory];
                scrollToBottom();
            }
        } catch (err) {
            aiMsg.content = err.message || "Ошибка связи.";
            chatHistory = [...chatHistory];
        } finally {
            isTyping = false;
            scrollToBottom();
        }
    }
</script>

<div class="flex flex-col h-[calc(100vh-180px)] w-full max-w-2xl mx-auto font-sans text-gray-900 dark:text-gray-100">
    <!-- Chat Header with Clear Action -->
    <header class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800/50 shrink-0">
        <h2 class="text-xs font-bold uppercase tracking-widest text-gray-400">Наставник</h2>
        {#if chatHistory.length > 0}
            <button 
                on:click={clearChat}
                class="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 rounded-md px-2 py-1"
                aria-label="Очистить историю чата"
            >
                Очистить
            </button>
        {/if}
    </header>

    <!-- Chat Feed -->
    <main class="flex-1 overflow-y-auto space-y-6 py-6 px-1 scrollbar-hide" aria-live="polite">
        {#if chatHistory.length === 0}
            <div class="h-full flex flex-col items-center justify-center gap-3 opacity-60" in:fade>
                <div class="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-1">
                    <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <p class="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 text-center">Чем могу помочь?</p>
            </div>
        {/if}

        {#each chatHistory as msg}
            <div 
                in:fly={{ y: 15, duration: 300, opacity: 0 }}
                class="flex flex-col w-full {msg.role === 'user' ? 'items-end' : 'items-start'}"
            >
                <div class="max-w-[85%] text-[15px] leading-relaxed px-5 py-3.5 shadow-sm {
                    msg.role === 'user' 
                        ? 'bg-[var(--canvas-accent,#007aff)] text-white rounded-[24px] rounded-br-sm' 
                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 text-[var(--canvas-text,inherit)] rounded-[24px] rounded-bl-sm'
                }">
                    {msg.content}
                </div>
                <span class="text-[10px] font-medium text-gray-400 mt-1.5 px-2 opacity-0 hover:opacity-100 transition-opacity">
                    {msg.role === 'user' ? 'Вы' : 'Наставник'}
                </span>
            </div>
        {/each}
        
        {#if isTyping && !chatHistory[chatHistory.length-1]?.content}
            <div class="flex items-start" in:fade={{ duration: 200 }}>
                <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-[24px] rounded-bl-sm px-5 py-4 shadow-sm flex items-center gap-1.5 w-fit">
                    <div class="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div class="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div class="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                </div>
            </div>
        {/if}
        <div bind:this={chatEnd}></div>
    </main>

    <!-- Message Input -->
    <div class="pt-2 pb-2 shrink-0 border-t border-gray-100 dark:border-gray-800/50">
        <form on:submit|preventDefault={sendMessage} class="relative flex items-center group mt-2">
            <input 
                bind:this={inputRef}
                bind:value={inputMessage}
                placeholder="Задайте вопрос..."
                class="w-full bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-full pl-5 pr-12 py-3 text-[15px] outline-none focus:border-[var(--canvas-accent,#007aff)] focus:ring-4 focus:ring-[var(--canvas-accent,#007aff)]/10 transition-all shadow-sm disabled:opacity-50"
                disabled={isTyping}
                aria-label="Поле ввода сообщения"
            />
            <button 
                type="submit"
                disabled={isTyping || !inputMessage.trim()}
                class="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-[var(--canvas-accent,#007aff)] text-white rounded-full disabled:opacity-30 disabled:bg-gray-300 disabled:scale-95 transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--canvas-accent,#007aff)]"
                aria-label="Отправить сообщение"
            >
                <svg class="w-4 h-4 translate-x-[1px] translate-y-[1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
            </button>
        </form>
    </div>
</div>
