'use client';

import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Unlink,
  Undo2,
  Redo2,
  RemoveFormatting,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RichTextEditorProps {
  /** Identificador opcional para asociar con etiquetas <label htmlFor="..."> */
  id?: string;
  /** Nombre del campo para enviar dentro de un <form> (Server Actions / FormData) */
  name?: string;
  /** Valor controlado (HTML string) */
  value?: string;
  /** Valor inicial por defecto (HTML o texto plano) */
  defaultValue?: string;
  /** Callback ejecutado cuando el contenido HTML cambia */
  onChange?: (html: string) => void;
  /** Texto cuando el editor está vacío */
  placeholder?: string;
  /** Si el editor está deshabilitado / solo lectura */
  disabled?: boolean;
  /** Si hay un error de validación (aplica borde rojo de error) */
  error?: boolean;
  /** Clases CSS para el contenedor exterior */
  className?: string;
  /** Clases CSS para el área editable interna */
  editorClassName?: string;
  /** Altura mínima del área editable (ej. "min-h-[140px]") */
  minHeight?: string;
  /** Si se debe ocultar la barra de herramientas superior */
  hideToolbar?: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={cn(
        'inline-flex items-center justify-center h-7 w-7 rounded-md text-xs font-medium transition-colors',
        'text-muted-foreground hover:bg-muted hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-30',
        isActive && 'bg-primary/15 text-primary hover:bg-primary/25 font-semibold'
      )}
    >
      {children}
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="w-[1px] h-4 bg-border mx-1 self-center shrink-0" />;
}

/**
 * RichTextEditor - Editor de texto enriquecido (WYSIWYG) basado en TipTap.
 *
 * Compatible con:
 * - Server Actions nativos mediante `<input type="hidden" name={name} />`
 * - Modo controlado (`value`, `onChange`) e incontrolado (`defaultValue`)
 * - Soporte para negrita, cursiva, subrayado, tachado, títulos (H1-H3),
 *   listas ordenadas y desordenadas, citas, enlaces, código e historial (undo/redo).
 * - Temas Claro/Oscuro y soporte con Tailwind CSS.
 */
export function RichTextEditor({
  id,
  name,
  value,
  defaultValue = '',
  onChange,
  placeholder = 'Escribe aquí el contenido...',
  disabled = false,
  error = false,
  className,
  editorClassName,
  minHeight = 'min-h-[140px]',
  hideToolbar = false,
}: RichTextEditorProps) {
  const [content, setContent] = React.useState<string>(defaultValue || value || '');
  const [isMounted, setIsMounted] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:opacity-80 transition cursor-pointer',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
    ],
    content: defaultValue || value || '',
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.isEmpty ? '' : currentEditor.getHTML();
      setContent(html);
      onChange?.(html);
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  });

  // Sincronizar cambios en modo controlado
  React.useEffect(() => {
    if (!editor || value === undefined) return;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml && (value !== '' || !editor.isEmpty)) {
      editor.commands.setContent(value, { emitUpdate: false });
      setContent(value);
    }
  }, [value, editor]);

  // Sincronizar estado disabled
  React.useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  const handleLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Introduce la URL del enlace:', previousUrl || 'https://');

    if (url === null) return;

    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const handleUnlink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  };

  // Fallback seguro durante SSR antes del montaje
  if (!isMounted) {
    return (
      <div
        className={cn(
          'w-full rounded-xl border border-input bg-background p-3 text-sm text-muted-foreground shadow-xs',
          minHeight,
          className
        )}
      >
        <span className="opacity-60">{placeholder}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group flex flex-col w-full rounded-xl border border-input bg-background shadow-xs transition-colors overflow-hidden',
        isFocused && 'ring-2 ring-ring border-ring',
        error && 'border-destructive ring-destructive',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      {/* Campo oculto para formularios nativos y Server Actions */}
      {name && <input type="hidden" id={id} name={name} value={content} />}

      {/* Barra de herramientas */}
      {!hideToolbar && editor && (
        <div className="flex flex-wrap items-center gap-0.5 px-2.5 py-1.5 border-b border-border bg-muted/30">
          {/* Historial */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo() || disabled}
            title="Deshacer (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo() || disabled}
            title="Rehacer (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarSeparator />

          {/* Encabezados */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            disabled={disabled}
            title="Título principal (H1)"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            disabled={disabled}
            title="Título de sección (H2)"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            disabled={disabled}
            title="Subtítulo (H3)"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarSeparator />

          {/* Estilos tipográficos */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            disabled={disabled}
            title="Negrita (Ctrl+B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            disabled={disabled}
            title="Cursiva (Ctrl+I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            disabled={disabled}
            title="Subrayado (Ctrl+U)"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            disabled={disabled}
            title="Tachado"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            disabled={disabled}
            title="Código en línea"
          >
            <Code className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarSeparator />

          {/* Listas y citas */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            disabled={disabled}
            title="Lista con viñetas"
          >
            <List className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            disabled={disabled}
            title="Lista numerada"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            disabled={disabled}
            title="Cita textual"
          >
            <Quote className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarSeparator />

          {/* Enlaces y divisores */}
          <ToolbarButton
            onClick={handleLink}
            isActive={editor.isActive('link')}
            disabled={disabled}
            title="Insertar o editar enlace"
          >
            <Link2 className="h-3.5 w-3.5" />
          </ToolbarButton>
          {editor.isActive('link') && (
            <ToolbarButton
              onClick={handleUnlink}
              disabled={disabled}
              title="Quitar enlace"
            >
              <Unlink className="h-3.5 w-3.5" />
            </ToolbarButton>
          )}
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            disabled={disabled}
            title="Línea horizontal"
          >
            <Minus className="h-3.5 w-3.5" />
          </ToolbarButton>

          <ToolbarSeparator />

          {/* Limpiar formato */}
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            disabled={disabled}
            title="Limpiar formato"
          >
            <RemoveFormatting className="h-3.5 w-3.5" />
          </ToolbarButton>
        </div>
      )}

      {/* Área de edición con estilos TipTap */}
      <div
        onClick={() => editor?.commands.focus()}
        className={cn(
          'tiptap-content p-3 text-sm text-foreground cursor-text transition-colors',
          minHeight,
          editorClassName
        )}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
