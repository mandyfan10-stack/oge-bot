## 2026-04-18 - [Fix XSS in User Chat Message]
**Vulnerability:** Cross-Site Scripting (XSS) vulnerability via `insertAdjacentHTML` for user messages.
**Learning:** The application was directly injecting unsanitized user input into the DOM using `insertAdjacentHTML`, allowing execution of arbitrary HTML and JavaScript payloads.
**Prevention:** Always use safe DOM APIs like `document.createElement` and `textContent` when rendering user-supplied data to prevent HTML/JS interpretation.

## 2026-04-21 - [Fix XSS in Formatting Editor Analysis]
**Vulnerability:** Cross-Site Scripting (XSS) via `innerHTML` in Task 13's formatting check.
**Learning:** Directly assigning user-editable content to an element's `innerHTML` (even a temporary one) triggers the execution of scripts (like `onerror` on an `img`).
**Prevention:** Use `DOMParser` to safely parse HTML content for analysis without executing any embedded scripts.
