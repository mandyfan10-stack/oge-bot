## 2026-04-18 - [Fix XSS in User Chat Message]
**Vulnerability:** Cross-Site Scripting (XSS) vulnerability via `insertAdjacentHTML` for user messages.
**Learning:** The application was directly injecting unsanitized user input into the DOM using `insertAdjacentHTML`, allowing execution of arbitrary HTML and JavaScript payloads.
**Prevention:** Always use safe DOM APIs like `document.createElement` and `textContent` when rendering user-supplied data to prevent HTML/JS interpretation.

## 2026-04-21 - [Fix DOM XSS in Task 13 HTML Parsing]
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) vulnerability via `innerHTML` assignment for parsing user-editable rich text.
**Learning:** The application was extracting text from an editable `div` by assigning its `innerHTML` to a temporary, off-screen element's `innerHTML` property. This caused the browser to execute any malicious scripts embedded within the user-provided HTML string (e.g. `<img onerror="...">`).
**Prevention:** Use `new DOMParser().parseFromString(htmlString, 'text/html')` to safely parse user-supplied HTML into a DOM document without executing scripts.
