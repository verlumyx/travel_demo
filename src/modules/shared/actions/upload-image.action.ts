'use server';

import { getSessionUser } from '@/modules/shared/auth/require-permission';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

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
const BUCKET_NAME = 'travel-media';

export async function uploadImageAction(
  formData: FormData,
  folder: 'destinations' | 'tours' | 'general' | 'payments' = 'general',
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

    const supabase = createSupabaseAdminClient();

    // Sanitizar extensión y armar ruta única
    const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const ext = ['jpeg', 'jpg', 'png', 'webp', 'avif', 'gif'].includes(rawExt)
      ? rawExt
      : 'jpg';

    const timestamp = Date.now();
    const randomId = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
    const filePath = `${folder}/${timestamp}-${randomId}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '31536000', // 1 año de caché
        upsert: false,
      });

    if (uploadError) {
      console.error('Error al subir a Supabase Storage:', uploadError);
      return {
        success: false,
        error: `Error al subir la imagen a Supabase Storage: ${uploadError.message}`,
      };
    }

    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicData.publicUrl,
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
