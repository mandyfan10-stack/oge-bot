<script>
    import { currentTask, taskVariables, correctAnswer } from '../stores/taskStore.js';
    import { tick } from 'svelte';
    import { fly, fade } from 'svelte/transition';

    let inputMessage = "";
    let chatHistory = [];
    let isTyping = false;
    let chatEnd;

    async function scrollToBottom() {
        await tick();
        chatEnd?.scrollIntoView({ behavior: 'smooth' });
    }

    async function sendMessage() {
        if (!inputMessage.trim() || isTyping) return;
        
        const userMsg = inputMessage;
        inputMessage = "";
        
        let systemContext = `Task: ${$currentTask}|Vars: ${JSON.stringify($taskVariables)}|CorrectAns: ${$correctAnswer}`;
        
        chatHistory = [...chatHistory, { role: "user", content: userMsg }];
        isTyping = true;
        scrollToBottom();

        try {
            const response = await fetch("https://oge-backend.onrender.com/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history: [{ role: "system", content: systemContext }, ...chatHistory.slice(-5)],
                    text: userMsg
                })
            });

            if (!response.ok) throw new Error("API Error");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiMsg = { role: "assistant", content: "" };
            chatHistory = [...chatHistory, aiMsg];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                aiMsg.content += decoder.decode(value);
                chatHistory = [...chatHistory]; // Trigger reactivity
                scrollToBottom();
            }
        } catch (err) {
            chatHistory = [...chatHistory, { role: "assistant", content: "⚠️ Ошибка связи с сервером. Проверь интернет или попробуй позже." }];
        } finally {
            isTyping = false;
            scrollToBottom();
        }
    }
</script>

<div class="glass-card rounded-[2rem] flex flex-col overflow-hidden border border-white/5 shadow-2xl">
    <!-- Chat Messages -->
    <div class="h-[400px] overflow-y-auto p-6 space-y-4 chat-scroll bg-slate-950/20">
        {#if chatHistory.length === 0}
            <div class="h-full flex flex-col items-center justify-center text-center p-8" in:fade>
                <div class="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                    <span class="text-2xl text-indigo-400">🤖</span>
                </div>
                <h4 class="text-white font-bold mb-2">Привет! Я твой наставник.</h4>
                <p class="text-xs text-slate-500 max-w-[200px]">Не понимаешь задачу? Просто спроси меня, и я помогу разобраться.</p>
            </div>
        {/if}

        {#each chatHistory as msg, i}
            <div 
                in:fly={{ y: 10, duration: 300 }}
                class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}"
            >
                <div class="max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed {msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/10' : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'}">
                    {msg.content}
                </div>
            </div>
        {/each}
        
        {#if isTyping && !chatHistory[chatHistory.length-1]?.content}
            <div class="flex justify-start">
                <div class="bg-white/5 px-5 py-3 rounded-2xl rounded-tl-none flex gap-1">
                    <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
            </div>
        {/if}
        <div bind:this={chatEnd}></div>
    </div>

    <!-- Input Area -->
    <form 
        on:submit|preventDefault={sendMessage}
        class="p-4 bg-slate-900/50 border-t border-white/5 flex gap-2"
    >
        <input 
            bind:value={inputMessage}
            placeholder="Спроси наставника..."
            class="flex-1 bg-slate-950/50 border border-white/10 px-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition-all"
        />
        <button 
            type="submit"
            disabled={isTyping || !inputMessage.trim()}
            class="bg-indigo-600 text-white w-12 h-11 rounded-xl flex items-center justify-center hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 transition-all shadow-lg shadow-indigo-600/10 active:scale-95"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
    </form>
</div>
