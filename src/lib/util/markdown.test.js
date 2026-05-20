import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './markdown.js';

describe('renderMarkdown', () => {
  it('returns empty string for null/undefined', () => {
    expect(renderMarkdown(null)).toBe('');
    expect(renderMarkdown(undefined)).toBe('');
  });

  it('renders bold text', () => {
    expect(renderMarkdown('**hello**')).toBe('<strong>hello</strong>');
  });

  it('renders multiple bold spans', () => {
    const result = renderMarkdown('**a** and **b**');
    expect(result).toBe('<strong>a</strong> and <strong>b</strong>');
  });

  it('converts newlines to <br>', () => {
    expect(renderMarkdown('line1\nline2')).toBe('line1<br>line2');
  });

  it('escapes XSS in plain text', () => {
    expect(renderMarkdown('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
  });

  it('escapes XSS inside bold', () => {
    const result = renderMarkdown('**<b>evil</b>**');
    expect(result).toContain('&lt;b&gt;');
    expect(result).not.toContain('<b>');
  });

  it('escapes ampersands', () => {
    expect(renderMarkdown('A & B')).toBe('A &amp; B');
  });

  it('handles plain text unchanged (modulo escaping)', () => {
    expect(renderMarkdown('hello world')).toBe('hello world');
  });
});
