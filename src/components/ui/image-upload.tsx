'use client';

import { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  ExternalLink,
  Link as LinkIcon,
  AlertCircle,
  RefreshCw,
  FileCheck,
} from 'lucide-react';

interface ImageUploadProps {
  name?: string;
  defaultValue?: string | null;
  folder?: 'destinations' | 'tours' | 'general' | 'payments';
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  maxSizeMb?: number;
  onUploadingChange?: (uploading: boolean) => void;
  onUrlChange?: (url: string) => void;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];

export function ImageUpload({
  name = 'imageUrl',
  defaultValue = '',
  label = 'Imagen',
  error,
  hint = 'Formatos recomendados: JPG, PNG, WebP o AVIF (máx. 2 MB).',
  required = false,
  maxSizeMb = 2,
  onUploadingChange,
  onUrlChange,
}: ImageUploadProps) {
  const [url, setUrl] = useState<string>(defaultValue || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onUploadingChange?.(false);
  }, [onUploadingChange]);

  // Limpiar URL temporal de preview al desmontar o cambiar archivo
  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const updateUrl = (newUrl: string) => {
    setUrl(newUrl);
    onUrlChange?.(newUrl);
  };

  const handleFileSelect = (file: File) => {
    setValidationError(null);

    // Validar formato
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setValidationError('Por favor selecciona una imagen válida (JPG, PNG, WebP o AVIF).');
      return;
    }

    // Validar tamaño
    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setValidationError(`La imagen excede el límite de ${maxSizeMb} MB.`);
      return;
    }

    // Limpiar preview anterior si existía
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setLocalPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelect(droppedFile);

      // Sincronizar el FileList con el input real para que viaje en FormData
      if (fileInputRef.current) {
        try {
          const dt = new DataTransfer();
          dt.items.add(droppedFile);
          fileInputRef.current.files = dt.files;
        } catch {
          // Si el navegador no soporta DataTransfer constructible, selectedFile persiste en estado
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    updateUrl('');
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayedError = error || validationError;
  const currentPreview = localPreviewUrl || url;

  return (
    <div className="space-y-2">
      {/* Label & Selector de Modo */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
          <ImageIcon className="h-4 w-4 text-teal-600" />
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'upload' ? 'url' : 'upload');
            setValidationError(null);
          }}
          className="text-xs text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1 transition cursor-pointer"
        >
          {mode === 'upload' ? (
            <>
              <LinkIcon className="h-3 w-3" />
              Ingresar URL externa
            </>
          ) : (
            <>
              <UploadCloud className="h-3 w-3" />
              Subir desde mi dispositivo
            </>
          )}
        </button>
      </div>

      {/* Input oculto con la URL existente o externa ingresada */}
      <input
        type="hidden"
        name={`${name}Existing`}
        value={mode === 'url' ? url : (selectedFile ? '' : url)}
      />

      {/* Input de archivo nativo que se enviará en el FormData al guardar */}
      <input
        ref={fileInputRef}
        id={name}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {/* Modo URL Externa */}
      {mode === 'url' && (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setSelectedFile(null);
                if (localPreviewUrl) {
                  URL.revokeObjectURL(localPreviewUrl);
                  setLocalPreviewUrl(null);
                }
                updateUrl(e.target.value);
              }}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm transition"
            />
            {url && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modo Subida o Vista con Imagen Actual */}
      {mode === 'upload' && (
        <>
          {currentPreview ? (
            /* Tarjeta con Preview de la Imagen */
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden group">
              <div className="h-48 sm:h-56 w-full relative bg-slate-100 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentPreview}
                  alt="Vista previa de imagen"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Barra inferior con detalles y acciones */}
              <div className="p-3 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {selectedFile ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                      <FileCheck className="h-3.5 w-3.5 text-teal-600" />
                      Listo para subir al guardar ({selectedFile.name} • {(selectedFile.size / 1024).toFixed(0)} KB)
                    </span>
                  ) : (
                    <>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Almacenada en Storage
                      </span>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-slate-600 text-xs inline-flex items-center gap-1 truncate max-w-[180px] sm:max-w-xs"
                        title={url}
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        <span className="truncate">{url}</span>
                      </a>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Cambiar
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Dropzone cuando no hay imagen seleccionada */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 transition-all text-center cursor-pointer ${
                isDragging
                  ? 'border-teal-500 bg-teal-50/50 scale-[0.99]'
                  : 'border-slate-200 hover:border-teal-400 bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col items-center justify-center py-3 space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-xs border border-teal-100/60">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800">
                    Arrastra tu imagen aquí o{' '}
                    <span className="text-teal-600 hover:underline">haz clic para examinar</span>
                  </p>
                  <p className="text-xs text-slate-500">{hint}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Previsualización en modo URL cuando existe una URL */}
      {mode === 'url' && url && (
        <div className="relative rounded-xl border border-slate-200 overflow-hidden h-36 bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Vista previa URL"
            className="w-full h-full object-cover"
            onError={() => setValidationError('No se pudo cargar la imagen desde la URL proporcionada.')}
          />
        </div>
      )}

      {/* Mensaje de Error */}
      {displayedError && (
        <div className="flex items-center gap-1.5 text-xs text-rose-500 mt-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{displayedError}</span>
        </div>
      )}
    </div>
  );
}
