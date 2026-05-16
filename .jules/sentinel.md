## 2024-05-16 - Prevent UI Locking and Client-Side DoS
**Vulnerability:** Missing timeout on external API requests (`fetch` in `AIChat.svelte`) and unbounded user text inputs.
**Learning:** If the backend API hangs, the UI thread waits indefinitely because JavaScript `fetch` has no built-in timeout, causing a poor UX. Unbounded text inputs also pose a DoS risk if a user pastes an excessively large string that the application tries to process.
**Prevention:** Use `AbortController` with `setTimeout` to enforce reasonable API request timeouts (e.g., 30s) and add permissive but bounding `maxlength` attributes to all user inputs.
