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
        
        chatHistory = [...chatHistory, { role: "user", content: userMsg }];
        const contextHistory = chatHistory.slice(-15);
        
        let aiMsg = { role: "assistant", content: "" };
        chatHistory = [...chatHistory, aiMsg];
        
        isTyping = true;
        scrollToBottom();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

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
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorMessage = "Ошибка связи.";
                if (response.status === 429 || response.status === 503 || response.status >= 400) {
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.reply || errorData.message || errorData.error || errorMessage;
                    } catch (e) {}
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

<div class="flex flex-col h-[calc(100vh-200px)] w-full relative">
    <!-- Neural Console Header -->
    <header class="flex items-center justify-between pb-4 mb-2 shrink-0 border-b border-white/5">
        <div class="flex items-center gap-3">
            <div class="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            <h2 class="mono-accent text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Neural Mentor v2.6</h2>
        </div>
        {#if chatHistory.length > 0}
            <button 
                on:click={clearChat}
                class="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-red-400 transition-colors"
            >
                [ Clear Buffer ]
            </button>
        {/if}
    </header>

    <!-- Unified Feed -->
    <main class="flex-1 overflow-y-auto space-y-8 py-6 px-1 scrollbar-hide">
        {#if chatHistory.length === 0}
            <div class="h-full flex flex-col items-center justify-center opacity-20" in:fade>
                <div class="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mb-4">
                    <div class="w-2 h-2 bg-white rounded-full animate-ping"></div>
                </div>
                <p class="mono-accent text-[9px] font-black uppercase tracking-[0.5em]">Waiting for query</p>
            </div>
        {/if}

        {#each chatHistory as msg}
            <div 
                in:fly={{ y: 20, duration: 500, opacity: 0 }}
                class="flex flex-col w-full {msg.role === 'user' ? 'items-end' : 'items-start'}"
            >
                <div class="max-w-[90%] text-lg font-light leading-relaxed px-6 py-4 relative {
                    msg.role === 'user' 
                        ? 'premium-glass-saturated !bg-blue-600/20 !border-blue-500/30 text-white rounded-[28px] rounded-br-none shadow-[0_10px_30px_rgba(0,122,255,0.1)]' 
                        : 'premium-glass !border-white/5 text-white/90 rounded-[28px] rounded-bl-none'
                }">
                    {msg.content}
                </div>
                <span class="mono-accent text-[8px] font-black uppercase tracking-[0.2em] text-white/20 mt-3 px-2">
                    {msg.role === 'user' ? '// User_Query' : '// Mentor_Response'}
                </span>
            </div>
        {/each}
        
        {#if isTyping && !chatHistory[chatHistory.length-1]?.content}
            <div class="flex items-start" in:fade>
                <div class="premium-glass px-6 py-4 rounded-[24px] flex items-center gap-2">
                    <div class="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div class="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div class="w-1 h-1 bg-white/40 rounded-full animate-bounce"></div>
                </div>
            </div>
        {/if}
        <div bind:this={chatEnd}></div>
    </main>

    <!-- Query Input Console -->
    <div class="pt-6 pb-2 shrink-0">
        <form on:submit|preventDefault={sendMessage} class="relative flex items-center group">
            <div class="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-[32px] blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <input 
                bind:this={inputRef}
                bind:value={inputMessage}
                placeholder="Type your question..."
                maxlength="250"
                class="relative w-full bg-white/[0.03] border border-white/10 rounded-[28px] pl-6 pr-16 py-4 text-base font-light outline-none focus:bg-white/[0.05] focus:border-blue-500/40 transition-all placeholder:text-white/10"
                disabled={isTyping}
            />
            <button 
                type="submit"
                disabled={isTyping || !inputMessage.trim()}
                class="absolute right-2 p-3 bg-white text-black rounded-full disabled:opacity-10 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
            </button>
        </form>
    </div>
</div>
