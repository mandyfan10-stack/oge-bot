# OGE-Bot — тренажёр ОГЭ по информатике

Telegram WebApp (стилизован под VK Mini App): тренажёр на 20 интерактивных заданий ОГЭ по информатике с генерацией вариантов + чат с ИИ-репетитором (Groq llama-3.3-70b через собственный бэкенд).

Бэкенд: [`oge_backend`](https://github.com/mandyfan10-stack/oge_backend) (FastAPI, деплой на Render).

## Стек

- **Svelte 4 + Vite 5** — SPA, монтируется в `#app` (`src/main.js`)
- **Tailwind CSS** — собирается в `styles.css`; кастомные VK-стили в `src/app.css`
- **Vitest** — юнит-тесты (`npm test`)
- **Playwright + pytest** — браузерные smoke-тесты (`tests/`)

## Разделы приложения

| Раздел | Компонент | Что делает |
|---|---|---|
| Моя страница | `ProfileDashboard` | решено N/20, точность, прогресс по темам, кнопка «Продолжить» |
| Практика | `TaskRunner` | текущее задание, проверка ответа, навигация пред./след., «Спросить ИИ» |
| Задания | `TaskList` | каталог 20 заданий: поиск + фильтры Все/Решённые/Нерешённые |
| Сообщения | `AIChat` | стриминговый чат с ИИ-репетитором, быстрые подсказки, контекст задания |
| Настройки | `SettingsPanel` | тема (авто/светлая/тёмная), сброс прогресса, очистка чата |

## Запуск

```bash
npm ci
npm run dev      # dev-сервер vite на :5173
npm test         # vitest (64 теста)
npm run build    # production-сборка в dist/ с base /oge-bot/
```

Браузерные smoke-тесты (опционально):

```bash
pip install -r requirements.txt
python -m playwright install chromium
python -m pytest tests/
```

## Архитектура

Подробное описание структуры, потока чата, инвариантов и подводных камней — в [CLAUDE.md](CLAUDE.md). Ключевое:

- Задания — `src/lib/tasks/components/Task1..20.svelte`, общий lifecycle через `setupTask()` (`taskSetup.js`).
- Правильный ответ (`correctAnswer`) никогда не персистится и никогда не отправляется на бэкенд; в чат уходит только `chatContextVars` (ключи с ответом вычищаются через `hideFromChat`).
- Прогресс и история чата хранятся в `localStorage`, ключи персонализованы по Telegram user-id.
- Markdown в чате — собственный XSS-safe мини-рендерер (whitelist: strong/em/code/br), внешние парсеры не подключать без аудита.

## Деплой

Push в `main` → GitHub Actions (`.github/workflows/deploy.yml`): тесты → сборка → публикация на GitHub Pages (ветка `gh-pages`, базовый URL `/oge-bot/`). Деплой не выполняется, если тесты упали.

## ENV

| Переменная | По умолчанию |
|---|---|
| `VITE_API_URL` | `https://oge-backend.onrender.com` |
