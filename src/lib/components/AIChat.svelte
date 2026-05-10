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
                chatHistory = [...chatHistory]; 
                scrollToBottom();
            }
        } catch (err) {
            chatHistory = [...chatHistory, { role: "assistant", content: "Ошибка связи." }];
        } finally {
            isTyping = false;
            scrollToBottom();
        }
    }
</script>

<div class="flex flex-col h-[calc(100vh-180px)]">
    <!-- Clean Feed -->
    <div class="flex-1 overflow-y-auto space-y-12 pb-12 scrollbar-hide">
        {#if chatHistory.length === 0}
            <div class="h-full flex items-center justify-center" in:fade>
                <p class="text-xs font-black uppercase tracking-[0.3em] text-gray-200 dark:text-gray-800">Диалог пуст</p>
            </div>
        {/if}

        {#each chatHistory as msg}
            <div 
                in:fly={{ y: 10, duration: 400 }}
                class="flex flex-col {msg.role === 'user' ? 'items-end' : 'items-start'}"
            >
                <span class="text-[9px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-700 mb-2">
                    {msg.role === 'user' ? 'Вы' : 'Наставник'}
                </span>
                <div class="max-w-[90%] text-lg font-light leading-relaxed {msg.role === 'user' ? 'text-right italic' : 'text-left'}">
                    {msg.content}
                </div>
            </div>
        {/each}
        
        {#if isTyping && !chatHistory[chatHistory.length-1]?.content}
            <div class="animate-pulse text-[9px] font-black uppercase tracking-widest text-gray-300">Печатает...</div>
        {/if}
        <div bind:this={chatEnd}></div>
    </div>

    <!-- Minimal Input -->
    <div class="pt-8 border-t border-gray-100 dark:border-gray-800">
        <form on:submit|preventDefault={sendMessage} class="flex items-center gap-4">
            <input 
                bind:value={inputMessage}
                placeholder="Ваш вопрос..."
                class="canvas-input text-base"
            />
            <button 
                type="submit"
                disabled={isTyping || !inputMessage.trim()}
                class="text-xs font-black uppercase tracking-widest disabled:opacity-20 transition-opacity"
            >
                Отправить
            </button>
        </form>
    </div>
</div>
