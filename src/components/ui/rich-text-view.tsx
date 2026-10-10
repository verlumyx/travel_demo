import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Elimina todas las etiquetas HTML de un texto, retornando texto plano limpio.
 * Útil para títulos, resúmenes, vistas previas y tablas con truncate.
 */
export function stripHtml(html?: string | null): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Comprueba si un fragmento HTML está efectivamente vacío
 * (es decir, null, undefined, texto en blanco o solo contiene etiquetas vacías como <p></p> o <br>).
 */
export function isEmptyHtml(html?: string | null): boolean {
  if (!html) return true;
  return stripHtml(html).length === 0;
}

const ALLOWED_TAGS = new Set([
  'p', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'span', 'div',
]);

const SAFE_HREF_REGEX = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

/**
 * Sanitiza una cadena HTML preservando las etiquetas de formato seguro
 * (listas, negrita, cursiva, títulos, enlaces seguros, citas) y eliminando
 * scripts, iframes, atributos on* y protocolos peligrosos como javascript:.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // 1. Eliminar etiquetas peligrosas y su contenido interno
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');

  // 2. Filtrar etiquetas y atributos
  sanitized = sanitized.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, rawTagName, rawAttrs) => {
    const tagName = rawTagName.toLowerCase();

    // Si la etiqueta no está permitida, descartar la etiqueta
    if (!ALLOWED_TAGS.has(tagName)) {
      return '';
    }

    // Si es cierre de etiqueta, retornar limpio
    if (match.startsWith('</')) {
      return `</${tagName}>`;
    }

    // Para etiquetas de apertura, sanitizar atributos
    const safeAttrs: string[] = [];

    // Extraer pares atributo="valor" o atributo='valor' o atributo=valor
    const attrRegex = /([a-z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/gi;
    let attrMatch: RegExpExecArray | null;

    while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';

      // Rechazar siempre manejadores de eventos (onclick, onerror, etc.)
      if (attrName.startsWith('on')) {
        continue;
      }

      if (tagName === 'a' && attrName === 'href') {
        const cleanHref = attrValue.trim();
        if (SAFE_HREF_REGEX.test(cleanHref)) {
          safeAttrs.push(`href="${cleanHref.replace(/"/g, '&quot;')}"`);
        } else {
          safeAttrs.push('href="#"');
        }
      } else if (tagName === 'a' && attrName === 'target') {
        if (attrValue === '_blank' || attrValue === '_self') {
          safeAttrs.push(`target="${attrValue}"`);
        }
      } else if (tagName === 'a' && attrName === 'rel') {
        safeAttrs.push('rel="noopener noreferrer"');
      } else if (attrName === 'class') {
        // Permitir clases visuales seguras
        const cleanClass = attrValue.replace(/["'<>]/g, '').trim();
        if (cleanClass) {
          safeAttrs.push(`class="${cleanClass}"`);
        }
      } else if (attrName === 'title') {
        safeAttrs.push(`title="${attrValue.replace(/"/g, '&quot;')}"`);
      }
    }

    // Si es <a> con target="_blank", asegurar rel="noopener noreferrer"
    if (tagName === 'a' && safeAttrs.some((a) => a.startsWith('target=')) && !safeAttrs.some((a) => a.startsWith('rel='))) {
      safeAttrs.push('rel="noopener noreferrer"');
    }

    const attrsString = safeAttrs.length > 0 ? ` ${safeAttrs.join(' ')}` : '';
    const isSelfClosing = match.endsWith('/>') || tagName === 'br' || tagName === 'hr';

    return `<${tagName}${attrsString}${isSelfClosing ? ' /' : ''}>`;
  });

  // 3. Eliminar párrafos vacíos redundantes al final (típicos de TipTap)
  sanitized = sanitized.replace(/(<p>\s*(<br\s*\/?>)?\s*<\/p>\s*)+$/gi, '');

  return sanitized;
}

export interface RichTextViewProps {
  /** Contenido HTML o texto plano a renderizar */
  content?: string | null;
  /** Texto o nodo de respaldo si el contenido está vacío */
  fallback?: React.ReactNode;
  /** Clases CSS adicionales para el contenedor */
  className?: string;
  /** Si es true, renderiza como texto plano (útil para extractos) */
  asPlainText?: boolean;
}

/**
 * RichTextView - Componente de renderizado para contenidos de RichTextEditor y textareas.
 *
 * Características:
 * - Detecta automáticamente si el contenido contiene etiquetas HTML o texto plano.
 * - Si es HTML, lo sanitiza de forma segura y aplica los estilos tipográficos enriquecidos
 *   (listas con viñetas 'ul', numeradas 'ol', negritas, citas, títulos H1-H3).
 * - Si es texto plano (datos heredados), preserva saltos de línea con 'whitespace-pre-line'.
 * - Si está vacío o solo contiene etiquetas vacías (<p></p>), muestra el fallback si se suministra.
 */
export function RichTextView({
  content,
  fallback,
  className,
  asPlainText = false,
}: RichTextViewProps) {
  if (isEmptyHtml(content)) {
    if (!fallback) return null;
    return typeof fallback === 'string' ? (
      <span className={cn('text-muted-foreground italic', className)}>{fallback}</span>
    ) : (
      <>{fallback}</>
    );
  }

  const raw = content ?? '';

  // Modo solo texto plano
  if (asPlainText) {
    return <span className={className}>{stripHtml(raw)}</span>;
  }

  // Comprobar si el contenido tiene etiquetas HTML
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(raw);

  if (!hasHtmlTags) {
    return (
      <div className={cn('whitespace-pre-line leading-relaxed', className)}>
        {raw}
      </div>
    );
  }

  const sanitized = sanitizeHtml(raw);

  return (
    <div
      className={cn('rich-text-content leading-relaxed', className)}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
