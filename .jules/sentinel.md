## 2024-05-24 - [Mitigating XSS via textContent in Dynamic Feedback]
**Vulnerability:** The application used `innerHTML` to inject dynamic feedback messages which could potentially contain unsanitized user-provided task parameters or responses.
**Learning:** Using `innerHTML` with string interpolation that incorporates user-influenced data introduces Cross-Site Scripting (XSS) risks. Even seemingly safe data might be manipulated.
**Prevention:** Always use safe DOM manipulation APIs like `textContent` or `innerText` when updating text data in the UI. If a mix of HTML structure (like icons) and text is needed, inject the structure first as a static string via `innerHTML` and then populate the text nodes dynamically using `.textContent`.
