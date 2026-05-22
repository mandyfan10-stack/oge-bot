# CLAUDE.md — oge-bot-main

Svelte 4 + Vite фронтенд OGE-Bot, работающий как Telegram WebApp (стилизован под VK Mini App). Тренажёр на 20 заданий ОГЭ по информатике + чат с ИИ-репетитором.

## Структура

```
src/main.js                — точка входа, монтирует App.svelte в #app
src/App.svelte             — корневой layout (VKHeader + VKSidebar + main switch по uiStore.currentSection)
src/app.css, tailwind.css  — стили; Tailwind собирается в styles.css
src/lib/
  api/chatClient.js        — sendChatMessage() async-generator над POST /api/chat (streaming reader)
  components/
    AIChat.svelte          — вкладка «Сообщения» (ИИ-репетитор)
    TaskRunner.svelte      — текущая задача
    TaskList.svelte        — список 20 заданий
    SettingsPanel.svelte   — настройки
    VKHeader/VKSidebar/VKPanel/VKButton.svelte — VK-стилизованные примитивы
  stores/
    chatStore.js     — история чата (persist в localStorage, rAF-coalesced стриминг)
    taskStore.js     — currentTask, taskVariables, correctAnswer, taskSolution
    progressStore.js — попытки и правильность ответов (persist)
    uiStore.js       — активная секция (profile/tasks/messages/settings)
  tasks/
    components/TaskN.svelte (N=1..20) — компоненты заданий
    taskMetadata.js / taskSetup.js / utils.js — генераторы и валидаторы
  util/
    telegram.js — обёртка над window.Telegram.WebApp (initData, haptics, theme, getUserId)
    markdown.js — мини-XSS-safe renderer (escape → **bold** → \n→<br>)
public/vendor/icons.js     — локальный Lucide-like icon set (без внешних CDN)
```

## Поток чата

1. `AIChat.svelte#sendMessage()` **сначала** снимает снапшот `history` через `chat.recent(15)` (этот метод фильтрует пустые сообщения), **потом** добавляет `pushUser(text)` + `startAssistant()` (пустой placeholder для стриминга).
2. `chatClient.sendChatMessage({ text, history, taskDescription })` шлёт POST на `${VITE_API_URL || 'https://oge-backend.onrender.com'}/api/chat` с заголовком `X-Telegram-Init-Data`.
3. Ответ читается как `ReadableStream` декодером UTF-8, чанки попадают в `chat.appendAssistantChunk(...)`. Реактивный апдейт сериализован через `requestAnimationFrame` (`schedulePublish`) — Svelte не ререндерится на каждый токен.
4. Ошибки превращаются в `ChatError(userMessage, status)`, текст подставляется в последний ассистент-месседж + появляется кнопка «Повторить» (повторяет `pendingText`).

## КРИТИЧЕСКИЙ инвариант чат-стора

История **не должна** содержать сообщений с пустым (или whitespace-only) `content` — бэкенд требует `min_length=1` и без страховочного валидатора отказал бы с HTTP 422. Поэтому:

- `loadInitial` фильтрует пустые сообщения при восстановлении из `localStorage` (через `isNonEmptyMessage`).
- `persist` не сохраняет trailing-placeholder (пустой ассистент во время стрима) — тот же фильтр.
- `recent(n)` фильтрует пустые перед отправкой (третий страховочный слой).

Симптом регрессии: после прерванного стрима следующий запрос мог возвращать 422 «String should have at least 1 character». Тест-кейсы в `chatStore.test.js` фиксируют поведение.

## localStorage-ключи

Все ключи персонализованы по Telegram user-id, если он доступен:

| Ключ | Содержимое |
|---|---|
| `uid:<id>:oge-bot:chat-history:v1` (либо `oge-bot:chat-history:v1`) | последние 50 сообщений чата |
| `uid:<id>:oge-bot:progress:v1` | попытки и успешность по заданиям |
| `uid:<id>:oge-bot:last-task` | последний открытый task id |

`correctAnswer` намеренно **не** персистится (SECURITY-комментарий в `taskStore.js`).

## ENV

| Переменная | По умолчанию |
|---|---|
| `VITE_API_URL` | `https://oge-backend.onrender.com` |

## Запуск

```bash
npm ci
npm run dev    # vite, порт 5173
npm run build  # сборка в dist/ с base '/oge-bot/'
npm test       # vitest, прогон *.test.js
```

Дополнительно `pytest tests/` — Playwright smoke-тесты (нужен `python -m playwright install chromium`).

## Деплой

`.github/workflows/deploy.yml` → push в `main` → GitHub Pages (`gh-pages` branch). Базовый URL `/oge-bot/`.

## Конвенции / подводные камни

- Запуск из `file://` блокируется CORS на бэкенде (Origin становится `null`). Открывать через GitHub Pages или dev-сервер.
- Markdown — только escape + `**bold**` + `\n→<br>` (`util/markdown.js`). Не подключать внешний markdown-парсер без аудита XSS.
- Стрим Groq отдаёт plain `text/plain` (не SSE) — не пытаться парсить как `EventSource`.
- Telegram-haptic вызовы обёрнуты в try/catch (`util/telegram.js`) — безопасно дёргать вне Telegram WebApp.
- При добавлении новых элементов истории чата всегда проверять: попадают ли они в `recent()` с непустым `content`. Тесты в `stores/chatStore.test.js` ловят регресс.
- `requestAnimationFrame` не существует в node-тестах — `vitest` мокает его через `setTimeout(0)` (см. `chatStore.test.js`).
