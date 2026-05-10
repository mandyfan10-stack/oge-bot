<script>
    import { currentTask, taskVariables, correctAnswer } from '../stores/taskStore.js';
    import { tick } from 'svelte';

    let inputMessage = "";
    let chatHistory = [];
    let isTyping = false;
    let chatEnd;

    async function scrollToBottom() {
        await tick();
        if (chatEnd) {
            chatEnd.scrollIntoView({ behavior: 'smooth' });
        }
    }

    async function sendMessage() {
        if (!inputMessage || isTyping) return;
        
        const userMsg = inputMessage;
        chatHistory = [...chatHistory, { role: "user", content: userMsg }];
        inputMessage = "";
        isTyping = true;
        await scrollToBottom();

        // OPTIMIZATION: Compress task context instead of sending full HTML
        let systemContext = `Task: ${$currentTask}|Vars: ${JSON.stringify($taskVariables)}|Ans: ${$correctAnswer}`;
        let payload = {
            history: [{ role: "system", content: systemContext }, ...chatHistory.slice(0, -1)],
            text: userMsg 
        };

        try {
            const response = await fetch("https://oge-backend.onrender.com/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let aiMsg = { role: "assistant", content: "" };
                chatHistory = [...chatHistory, aiMsg];
                const aiMsgIndex = chatHistory.length - 1;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    
                    // The backend sends raw text or chunks
                    aiMsg.content += chunk;
                    chatHistory[aiMsgIndex] = { ...aiMsg };
                    await scrollToBottom();
                }
            } else {
                chatHistory = [...chatHistory, { role: "assistant", content: "Error: Could not reach the mentor." }];
            }
        } catch (error) {
            console.error("Chat error:", error);
            chatHistory = [...chatHistory, { role: "assistant", content: "Error: Connection failed." }];
        } finally {
            isTyping = false;
            await scrollToBottom();
        }
    }
</script>

<div class="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
    <div class="bg-blue-600 text-white p-3 font-bold flex items-center gap-2">
        <span class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
        AI Mentor
    </div>
    
    <div class="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[500px]">
        {#if chatHistory.length === 0}
            <div class="text-gray-500 text-center italic mt-10">
                Ask me anything about the task!
            </div>
        {/if}
        
        {#each chatHistory as msg}
            <div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'}">
                <div class="max-w-[80%] rounded-lg p-3 {msg.role === 'user' ? 'bg-blue-100 text-blue-900 rounded-tr-none' : 'bg-gray-100 text-gray-900 rounded-tl-none'}">
                    <p class="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
            </div>
        {/each}
        
        {#if isTyping && !chatHistory[chatHistory.length-1]?.content}
            <div class="flex justify-start">
                <div class="bg-gray-100 rounded-lg p-3 rounded-tl-none flex gap-1">
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
            </div>
        {/if}
        <div bind:this={chatEnd}></div>
    </div>

    <div class="p-3 border-t border-gray-200 bg-gray-50">
        <form on:submit|preventDefault={sendMessage} class="flex gap-2">
            <input 
                bind:value={inputMessage} 
                type="text"
                placeholder="Type your question..." 
                class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isTyping}
            />
            <button 
                type="submit"
                disabled={!inputMessage || isTyping}
                class="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
                Send
            </button>
        </form>
    </div>
</div>
