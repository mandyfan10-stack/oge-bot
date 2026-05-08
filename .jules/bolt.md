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

## 2026-04-22 - Prevent Unnecessary DOM Re-renders and Icon Scans in List Views
**Learning:** In vanilla JS, repeatedly reconstructing `innerHTML` for static lists on navigation causes redundant parsing, triggers unnecessary garbage collection, and forces global icon libraries (like `lucide.createIcons`) to rescan the DOM needlessly.
**Action:** Use a global cache (`const taskDOMCache = {}`) to store references to child nodes (`Array.from(list.childNodes)`) the first time a list is generated. On subsequent views, check the cache and use `list.replaceChildren(...cache[id])` to re-insert the existing DOM nodes directly, bypassing parsing and icon scanning entirely.

## 2024-05-25 - Avoid querying DOM and unneeded property mutations in requestAnimationFrame
**Learning:** In interactive tasks using `requestAnimationFrame` (like the Robot 10x10 grid), doing `document.getElementById` and unconditional `element.className =` assignments inside tight loops (like 100x100 grid cells) causes severe layout thrashing and performance degradation.
**Action:** Cache the DOM node references once in an array/map and reuse them. Also, add equality guards (e.g. `if (element.className !== newClassName) element.className = newClassName`) to prevent unnecessary style recalculations.

## 2025-01-20 - Optimize Grid Simulation Checks
**Learning:** In the robot simulator, tight nested loops (like the `drawGrid` rendering function and `hasWall` collision detection used heavily in simulation) are primary performance bottlenecks because they repeatedly perform O(N) linear array scans (`Array.some()`) to check for walls at specific coordinates. This is particularly inefficient during fast simulations.
**Action:** Optimize these lookups by pre-calculating wall `Set` objects during the task's `setup` phase. Use a consistent stringification pattern (e.g., the existing `cellKey(x, y)` function) to convert 2D coordinates into string keys. This replaces O(N) array searches with O(1) `Set.has()` lookups, significantly improving performance in tight execution and rendering loops.
