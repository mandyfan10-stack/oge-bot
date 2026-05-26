const cryptoSource = (typeof window !== 'undefined' && (window.crypto || window.msCrypto)) || null;
// ⚡ Bolt: Pre-allocate randomBuffer to avoid GC thrashing on high-frequency calls.
// Impact: Eliminates O(N) Uint32Array allocations in tight loops (e.g., shuffleArray).
const randomBuffer = new Uint32Array(1);

export function randomUnit() {
  if (cryptoSource?.getRandomValues) {
    cryptoSource.getRandomValues(randomBuffer);
    return randomBuffer[0] / 0x100000000;
  }
  return Math.random();
}

export function getRandomInt(min, max) { 
  return Math.floor(randomUnit() * (max - min + 1)) + min; 
}

export function getRandomElement(arr) { 
  return arr[Math.floor(randomUnit() * arr.length)]; 
}

export function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomUnit() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function getRandomBool() { 
  return randomUnit() > 0.5; 
}