## 2026-04-18 - [Fix XSS in User Chat Message]
**Vulnerability:** Cross-Site Scripting (XSS) vulnerability via `insertAdjacentHTML` for user messages.
**Learning:** The application was directly injecting unsanitized user input into the DOM using `insertAdjacentHTML`, allowing execution of arbitrary HTML and JavaScript payloads.
**Prevention:** Always use safe DOM APIs like `document.createElement` and `textContent` when rendering user-supplied data to prevent HTML/JS interpretation.

## 2026-04-21 - [Fix DOM XSS in Task 13 HTML Parsing]
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) vulnerability via `innerHTML` assignment for parsing user-editable rich text.
**Learning:** The application was extracting text from an editable `div` by assigning its `innerHTML` to a temporary, off-screen element's `innerHTML` property. This caused the browser to execute any malicious scripts embedded within the user-provided HTML string (e.g. `<img onerror="...">`).
**Prevention:** Use `new DOMParser().parseFromString(htmlString, 'text/html')` to safely parse user-supplied HTML into a DOM document without executing scripts.

## 2026-04-22 - [Fix XSS in AI Chat Messages]
**Vulnerability:** Cross-Site Scripting (XSS) vulnerability via `insertAdjacentHTML` for AI responses.
**Learning:** The application directly rendered AI responses (which could potentially be manipulated or contain injected payloads if the backend or transport is compromised) using `insertAdjacentHTML`.
**Prevention:** Always use safe DOM APIs like `document.createElement` and `textContent` (or `createTextNode`) when rendering dynamic responses, particularly text that might be uncontrolled, and append the elements explicitly.

## 2026-04-23 - [Fix DOM XSS in Feedback Alerts]
**Vulnerability:** DOM-based XSS via `innerHTML` on `iconContainer` in `showFeedback`.
**Learning:** Direct assignment of strings via `innerHTML` causes arbitrary HTML evaluation, risking DOM XSS. While current usage sets static HTML snippet strings, changing it to `document.createElement` and DOM nodes mitigates future risk if user data gets accidentally concatenated.
**Prevention:** Use safe DOM APIs like `document.createElement` and avoid `innerHTML`.
## 2024-05-24 - Missing Timeout and Max Length Limits on AI Chat Input
**Vulnerability:** External fetch to `oge-backend.onrender.com/api/chat` lacked timeout controls, which could lock UI if external API hung. The chat input also lacked `maxlength`, risking DoS on backend/parsing.
**Learning:** External API interactions should always be wrapped with timeouts, especially if they block user inputs. Also, user inputs sent to backends need basic client-side limits.
**Prevention:** Always use `AbortController` alongside `fetch()` with `setTimeout()`. Add `maxlength` attributes to any free-text inputs.
## 2026-04-26 - [DoS via Missing Max Length Limits]
**Vulnerability:** Input length missing.
**Learning:** The chat interface lacked limits to length inputs.
**Prevention:** Added `maxlength` to input and textareas elements.
