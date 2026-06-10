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

  it('renders italic text', () => {
    expect(renderMarkdown('*hello*')).toBe('<em>hello</em>');
  });

  it('renders bold and italic together', () => {
    expect(renderMarkdown('**a** and *b*')).toBe('<strong>a</strong> and <em>b</em>');
  });

  it('renders inline code', () => {
    expect(renderMarkdown('use `print(x)` here')).toBe('use <code>print(x)</code> here');
  });

  it('does not format markdown inside inline code', () => {
    expect(renderMarkdown('`a**b**c`')).toBe('<code>a**b**c</code>');
    expect(renderMarkdown('`x*y*z`')).toBe('<code>x*y*z</code>');
  });

  it('escapes XSS inside inline code', () => {
    const result = renderMarkdown('`<img onerror=alert(1)>`');
    expect(result).toContain('&lt;img');
    expect(result).not.toContain('<img');
  });

  it('renders multiple code spans independently', () => {
    expect(renderMarkdown('`a` and `b`')).toBe('<code>a</code> and <code>b</code>');
  });

  it('strips NUL sentinels from input (no placeholder spoofing)', () => {
    const NUL = String.fromCharCode(0);
    const result = renderMarkdown('x' + NUL + '0' + NUL + 'y `code`');
    expect(result).toBe('x0y <code>code</code>');
  });

  it('keeps unpaired backticks literal', () => {
    expect(renderMarkdown('a ` b')).toBe('a ` b');
  });

  it('keeps unpaired asterisks literal', () => {
    expect(renderMarkdown('2 * 3 = 6')).toBe('2 * 3 = 6');
  });
});
