## 2026-04-18 - [Fix XSS in User Chat Message]
**Vulnerability:** Cross-Site Scripting (XSS) vulnerability via `insertAdjacentHTML` for user messages.
**Learning:** The application was directly injecting unsanitized user input into the DOM using `insertAdjacentHTML`, allowing execution of arbitrary HTML and JavaScript payloads.
**Prevention:** Always use safe DOM APIs like `document.createElement` and `textContent` when rendering user-supplied data to prevent HTML/JS interpretation.
