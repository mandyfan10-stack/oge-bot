## 2026-04-18 - [Fix XSS in User Chat Message]
**Vulnerability:** Cross-Site Scripting (XSS) vulnerability via `insertAdjacentHTML` for user messages.
**Learning:** The application was directly injecting unsanitized user input into the DOM using `insertAdjacentHTML`, allowing execution of arbitrary HTML and JavaScript payloads.
**Prevention:** Always use safe DOM APIs like `document.createElement` and `textContent` when rendering user-supplied data to prevent HTML/JS interpretation.

## 2025-02-28 - [Fix XSS in AI Chat Response]
**Vulnerability:** Cross-Site Scripting (XSS) vulnerability via `insertAdjacentHTML` for AI responses.
**Learning:** The application was inserting unsanitized AI responses directly into the DOM using `insertAdjacentHTML`, making it vulnerable if the AI response contained malicious HTML (e.g. `<img src=x onerror=...>`).
**Prevention:** Always use safe DOM API methods like `document.createElement` and `document.createTextNode` (or `.textContent`) to insert dynamic text.
