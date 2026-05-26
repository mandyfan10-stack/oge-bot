## 2025-02-28 - Optimize Uint32Array allocations in randomUnit
**Learning:** Instantiating `new Uint32Array(1)` inside the `randomUnit` function, which is called frequently in nested loops and array shuffling (`shuffleArray`), causes unnecessary O(N) allocation overhead and severe garbage collection thrashing.
**Action:** Pre-allocate static typed arrays like `Uint32Array` at the module scope when they are just used as short-lived buffers for cryptographic random value generation.
