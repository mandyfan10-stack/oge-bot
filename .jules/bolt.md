## 2026-04-18 - Prevent Unnecessary DOM Re-renders and Icon Scans
**Learning:** In a vanilla JS single-page application heavily relying on `innerHTML` for template rendering and a global icon library like Lucide (`lucide.createIcons()`), frequently re-rendering entire lists on navigation (e.g., exiting a task or course) causes severe performance bottlenecks. It needlessly triggers garbage collection, rebuilds the DOM, restarts entry animations, and forces the icon library to rescan the entire page.
**Action:** Instead of re-rendering whole structures (like list of courses or tasks) whenever the user navigates back, use targeted DOM mutations. Assign unique `id`s to specific elements (like progress bars, text spans, or checkmarks) and update them directly in place when their state changes (e.g., when a task is completed). Remove redundant full-render calls from navigation functions (`closeTask`, `closeCourse`).

## 2026-04-19 - Cache Dynamic Function Evaluations in Loops
**Learning:** Parsing and splitting strings to evaluate logic conditions dynamically inside a tight execution loop severely impacts performance (measured 8x slowdown).
**Action:** Parse condition strings once into a structured execution tree (e.g., array of actions) and store them in a cache mapping the string to an evaluator function. Evaluate the cached structured functions rather than parsing strings on each loop iteration.
## 2024-05-24 - Scoping global library DOM scans
**Learning:** Frequent state changes (like showing task feedback) that trigger global DOM scans (e.g., `lucide.createIcons()`) without scoping can cause significant lag, particularly on mobile devices. Full `innerHTML` replacements also cause excessive garbage collection and re-parse overhead.
**Action:** Always scope DOM scanning libraries using `{ root: element }`. Avoid full `innerHTML` re-renders for state updates; instead, use targeted DOM mutations via unique IDs (e.g., modifying specific `textContent` or specific nested element `innerHTML`).

## 2026-04-21 - Optimize Animation Loops
**Learning:** In interactive tasks using `requestAnimationFrame` for visualization (like the Robot 10x10 grid), rebuilding the entire DOM structure on every tick using `innerHTML` causes heavy layout thrashing and severe performance degradation, especially on mobile devices.
**Action:** Initialize static HTML structures only once. During the animation loop, perform targeted updates on specific elements (e.g. by setting `className` and changing `innerHTML` of individual cell elements using unique IDs).
