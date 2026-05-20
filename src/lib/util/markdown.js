/**
 * Safe inline-markdown renderer for AI messages.
 *
 * 1. Escapes HTML first (XSS-safe — `{@html}` consumers are protected).
 * 2. Converts **text** → <strong>text</strong>.
 * 3. Converts newlines → <br>.
 *
 * @param {string} text
 * @returns {string} HTML string ready for {@html ...}
 */
export function renderMarkdown(text) {
  if (text == null) return '';
  const escaped = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}
