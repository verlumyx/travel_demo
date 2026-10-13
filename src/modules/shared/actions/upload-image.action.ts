'use server';

import { getSessionUser } from '@/modules/shared/auth/require-permission';
import { storageService, type UploadFolder } from '@/modules/shared/services/storage.service';

export interface UploadImageResult {
  success: boolean;
  url?: string;
  error?: string;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

export async function uploadImageAction(
  formData: FormData,
  folder: UploadFolder = 'general',
): Promise<UploadImageResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return {
        success: false,
        error: 'No autorizado. Se requiere una sesión administrativa activa.',
      };
    }

    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return {
        success: false,
        error: 'No se ha proporcionado un archivo válido.',
      };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'Formato no permitido. Solo se aceptan imágenes JPG, PNG, WebP o AVIF.',
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: 'La imagen excede el tamaño máximo permitido de 2 MB.',
      };
    }

    const url = await storageService.uploadFile(file, {
      folder,
      maxSizeBytes: MAX_FILE_SIZE,
    });

    return {
      success: true,
      url,
    };
  } catch (error: unknown) {
    console.error('Error inesperado en uploadImageAction:', error);
    const message =
      error instanceof Error ? error.message : 'Error inesperado al procesar la imagen.';
    return {
      success: false,
      error: message,
    };
  }
}
