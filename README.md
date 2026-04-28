# OGE Bot Project Notes

## What this repo is

Telegram mini-app trainer for OGE informatics. The frontend is a mostly self-contained `index.html` with courses, 20 interactive tasks, Lucide icons, Telegram haptics, and an AI mentor chat.

Backend repo when needed: `C:\Users\serge\Documents\oge_backend-main`.

## Current architecture

- Main UI, task generators, validation logic, animations, haptics, and chat live in `index.html`.
- Tests live in `tests/`; pytest smoke checks parse the HTML and frontend structure.
- AI mentor endpoint is configured as `https://oge-backend.onrender.com/api/chat`.
- Icons are Lucide icons rendered through `renderLucideIcons(...)`; after injecting dynamic HTML, call it on the updated root.
- Task reset uses crypto-backed randomness through `randomUnit()` and retries the new task state to avoid repeating the last generated variant.

## Rules for future edits

- Keep the existing visual style and functionality unless the user explicitly asks to change them.
- For performance work, prefer local DOM updates, cached lookups, and shared helpers over broad refactors.
- When adding dynamic buttons or task controls, call `enhanceInteractiveElements(...)` so animations and haptics stay consistent.
- Do not commit generated caches such as `.pytest_cache`, `__pycache__`, or temporary QA screenshots.

## Verification checklist

- Frontend syntax: extract the inline script and compile it with Node `vm.Script`.
- Frontend tests: `python -m pytest` from this repo.
- Browser smoke: load the app, open all 20 tasks, check no unrendered `i[data-lucide]` icons remain, and run correct-answer checks for every task.
- Backend tests when backend changes: `python -m pytest` from `C:\Users\serge\Documents\oge_backend-main`.

## Latest work notes

- Reset/regenerate was strengthened on 2026-04-26: all task generators now use shared crypto-backed randomness, and reset retries to avoid the exact previous variant.
- Browser verification on 2026-04-26 checked all 20 tasks on mobile and desktop: every generated task accepted its correct answer, every reset changed the generated state, and Lucide icons rendered fully.
- Backend `server.py` currently caches allowed CORS origins once at startup and reuses that value in middleware and health checks.
- Task 15 was expanded on 2026-04-26: robot maps now generate multiple random horizontal/vertical wall segments with passages, random start cells, a visible finish cell, reachability checks, and larger target sets so reset feels closer to a new exam variant.
- Mobile performance mode was added on 2026-04-27: weak mobile/Telegram WebView sessions reduce heavy effects, chat DOM is pruned, repeated UI enhancement is idempotent, and task 15 updates only changed grid cells during robot playback.
- AI chat diagnostics were clarified on 2026-04-27: direct backend calls work, but browser launches from `file://` are blocked by backend CORS because the request origin becomes `null`; use the published GitHub Pages origin unless backend CORS is expanded.
- Full frontend optimization on 2026-04-28: Tailwind now builds to local `styles.css`, Lucide was replaced by a small local icon renderer, heavy utility classes were stripped from task markup, and unnecessary GPU layer hints were removed.
