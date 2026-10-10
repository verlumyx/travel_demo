import { describe, it, expect } from 'vitest';
import { stripHtml, isEmptyHtml, sanitizeHtml } from '@/components/ui/rich-text-view';

describe('RichTextView utilities', () => {
  describe('stripHtml', () => {
    it('returns empty string for null or undefined', () => {
      expect(stripHtml(null)).toBe('');
      expect(stripHtml(undefined)).toBe('');
      expect(stripHtml('')).toBe('');
    });

    it('removes tags and extracts plain text', () => {
      expect(stripHtml('<p>Hola <b>Mundo</b></p>')).toBe('Hola Mundo');
    });

    it('extracts plain text from complex lists and paragraphs', () => {
      const html = '<ul><li><p>asd</p></li><li><p>asda</p></li></ul><p></p>';
      expect(stripHtml(html)).toBe('asd asda');
    });

    it('handles html entities correctly', () => {
      expect(stripHtml('<p>Tom &amp; Jerry &nbsp;&lt;3</p>')).toBe('Tom & Jerry <3');
    });
  });

  describe('isEmptyHtml', () => {
    it('detects empty strings, null, and undefined', () => {
      expect(isEmptyHtml(null)).toBe(true);
      expect(isEmptyHtml(undefined)).toBe(true);
      expect(isEmptyHtml('')).toBe(true);
      expect(isEmptyHtml('   ')).toBe(true);
    });

    it('detects empty HTML tags as empty', () => {
      expect(isEmptyHtml('<p></p>')).toBe(true);
      expect(isEmptyHtml('<p><br></p>')).toBe(true);
      expect(isEmptyHtml('<p>&nbsp;</p>')).toBe(true);
      expect(isEmptyHtml('<div><p>   </p></div>')).toBe(true);
    });

    it('identifies non-empty HTML as not empty', () => {
      expect(isEmptyHtml('<p>asd</p>')).toBe(false);
      expect(isEmptyHtml('<ul><li><p>asd</p></li><li><p>asda</p></li></ul><p></p>')).toBe(false);
      expect(isEmptyHtml('Plain text')).toBe(false);
    });
  });

  describe('sanitizeHtml', () => {
    it('removes script tags and javascript execution', () => {
      const dirty = '<script>alert("xss")</script><p>Contenido seguro</p>';
      expect(sanitizeHtml(dirty)).toBe('<p>Contenido seguro</p>');
    });

    it('removes onclick and other event handler attributes', () => {
      const dirty = '<p onclick="alert(1)">Texto <span onmouseover="bad()">aquí</span></p>';
      expect(sanitizeHtml(dirty)).toBe('<p>Texto <span>aquí</span></p>');
    });

    it('sanitizes dangerous hrefs to # and preserves safe links', () => {
      const dirty = '<a href="javascript:alert(1)">Peligro</a><a href="https://example.com" target="_blank">Seguro</a>';
      const clean = sanitizeHtml(dirty);
      expect(clean).toContain('href="#"');
      expect(clean).toContain('href="https://example.com"');
      expect(clean).toContain('rel="noopener noreferrer"');
    });

    it('preserves valid lists and formatting matching TipTap', () => {
      const tipTapHtml = '<ul><li><p>asd</p></li><li><p>asda</p></li></ul><p></p>';
      const cleaned = sanitizeHtml(tipTapHtml);
      expect(cleaned).toBe('<ul><li><p>asd</p></li><li><p>asda</p></li></ul>');
    });
  });
});
