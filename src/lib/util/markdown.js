/**
 * Safe inline-markdown renderer for AI messages.
 *
 * 1. Escapes HTML first (XSS-safe — `{@html}` consumers are protected).
 * 2. Extracts `inline code` spans into placeholders so their content is
 *    not touched by bold/italic processing.
 * 3. Converts **text** → <strong>, *text* → <em>.
 * 4. Restores code spans as <code>…</code>.
 * 5. Converts newlines → <br>.
 *
 * Deliberately minimal: no external parser, no links, no images — the
 * whitelist of produced tags is exactly strong/em/code/br.
 */

// NUL is stripped from the input before processing, so the sentinel can
// never collide with real content coming from the user or the AI stream.
const SENTINEL = String.fromCharCode(0);
const SENTINEL_RE = new RegExp(SENTINEL, 'g');
const PLACEHOLDER_RE = new RegExp(`${SENTINEL}(\\d+)${SENTINEL}`, 'g');

/**
 * @param {string} text
 * @returns {string} HTML string ready for {@html ...}
 */
export function renderMarkdown(text) {
  if (text == null) return '';
  const escaped = String(text)
    .replace(SENTINEL_RE, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // Pull out `code` spans first — markdown inside code must stay literal.
  /** @type {string[]} */
  const codeSpans = [];
  const withPlaceholders = escaped.replace(/`([^`\n]+)`/g, (_, code) => {
    codeSpans.push(code);
    return `${SENTINEL}${codeSpans.length - 1}${SENTINEL}`;
  });

  const formatted = withPlaceholders
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

  return formatted
    .replace(PLACEHOLDER_RE, (_, i) => `<code>${codeSpans[Number(i)]}</code>`)
    .replace(/\n/g, '<br>');
}
