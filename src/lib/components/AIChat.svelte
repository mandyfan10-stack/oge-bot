<script>
    import { currentTask, taskVariables, correctAnswer } from '../stores/taskStore.js';
    import { tick } from 'svelte';

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
            chatHistory = [...chatHistory, { role: "assistant", content: "⚠️ Ошибка связи с сервером. Попробуй позже." }];
        } finally {
            isTyping = false;
            scrollToBottom();
        }
    }
</script>

<div class="flex flex-col h-[calc(100vh-100px)]">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-tg-bg sticky top-0 z-10">
        <h2 class="text-lg font-bold text-tg-text">AI Наставник</h2>
        <p class="text-xs text-tg-hint">Поможет с задачей {$currentTask}</p>
    </div>

    <!-- Chat Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-tg-secondaryBg">
        {#if chatHistory.length === 0}
            <div class="flex flex-col items-center justify-center h-full text-center p-4">
                <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <span class="text-2xl">🤖</span>
                </div>
                <h4 class="text-tg-text font-semibold mb-1">Привет! Я твой наставник.</h4>
                <p class="text-sm text-tg-hint">Если не понимаешь решение задачи, напиши мне.</p>
            </div>
        {/if}

        {#each chatHistory as msg}
            <div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
                <div class="max-w-[85%] px-4 py-2.5 text-[15px] leading-snug {
                    msg.role === 'user' 
                    ? 'bg-tg-button text-tg-buttonText rounded-2xl rounded-br-sm' 
                    : 'bg-tg-bg text-tg-text rounded-2xl rounded-bl-sm border border-gray-200 dark:border-gray-800'
                }">
                    {msg.content}
                </div>
            </div>
        {/each}
        
        {#if isTyping && !chatHistory[chatHistory.length-1]?.content}
            <div class="flex justify-start">
                <div class="bg-tg-bg px-4 py-3 rounded-2xl rounded-bl-sm border border-gray-200 dark:border-gray-800 flex gap-1 items-center">
                    <div class="w-1.5 h-1.5 bg-tg-hint rounded-full animate-bounce"></div>
                    <div class="w-1.5 h-1.5 bg-tg-hint rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    <div class="w-1.5 h-1.5 bg-tg-hint rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
            </div>
        {/if}
        <div bind:this={chatEnd}></div>
    </div>

    <!-- Input Area -->
    <div class="p-3 bg-tg-bg border-t border-gray-200 dark:border-gray-800">
        <form 
            on:submit|preventDefault={sendMessage}
            class="flex items-end gap-2 max-w-2xl mx-auto"
        >
            <input 
                bind:value={inputMessage}
                placeholder="Сообщение..."
                class="flex-1 bg-tg-secondaryBg border-none px-4 py-3 rounded-2xl text-[15px] text-tg-text placeholder:text-tg-hint outline-none"
            />
            <button 
                type="submit"
                disabled={isTyping || !inputMessage.trim()}
                class="bg-tg-button text-tg-buttonText w-11 h-11 rounded-full flex flex-shrink-0 items-center justify-center disabled:opacity-50 transition-opacity active:opacity-70"
            >
                <svg class="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
        </form>
    </div>
</div>
