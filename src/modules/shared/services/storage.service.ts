import fs from 'node:fs/promises';
import path from 'node:path';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export type UploadFolder = 'destinations' | 'tours' | 'general' | 'payments';

export interface UploadOptions {
  folder?: UploadFolder;
  bucket?: string;
  allowedExts?: string[];
  maxSizeBytes?: number;
}

const DEFAULT_BUCKET = 'travel-media';
const DEFAULT_ALLOWED_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'pdf'];
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export class StorageService {
  private readonly defaultBucket: string;

  constructor(defaultBucket = DEFAULT_BUCKET) {
    this.defaultBucket = defaultBucket;
  }

  /**
   * Sube un objeto File a Supabase Storage (o almacenamiento local como fallback)
   */
  async uploadFile(file: File, options?: UploadOptions): Promise<string> {
    const maxSizeBytes = options?.maxSizeBytes || DEFAULT_MAX_SIZE;
    if (file.size > maxSizeBytes) {
      throw new Error(`El archivo excede el tamaño máximo permitido (${(maxSizeBytes / (1024 * 1024)).toFixed(0)} MB).`);
    }

    const folder = options?.folder || 'general';
    const allowedExts = options?.allowedExts || DEFAULT_ALLOWED_EXTS;

    const rawExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    const ext = allowedExts.includes(rawExt) ? rawExt : 'png';

    const timestamp = Date.now();
    const randomId = crypto.randomUUID().replace(/-/g, '').slice(0, 10);
    const fileName = `${folder}/${timestamp}-${randomId}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const contentType = file.type || (ext === 'pdf' ? 'application/pdf' : `image/${ext === 'jpg' ? 'jpeg' : ext}`);

    return this.uploadBuffer(buffer, fileName, contentType, options?.bucket || this.defaultBucket, folder, ext);
  }

  /**
   * Sube un Buffer binario a Supabase Storage con fallback local
   */
  async uploadBuffer(
    buffer: Buffer,
    filePath: string,
    contentType: string,
    bucket = this.defaultBucket,
    folder: UploadFolder = 'general',
    ext = 'png',
  ): Promise<string> {
    try {
      const supabase = createSupabaseAdminClient();
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, buffer, {
          contentType,
          cacheControl: '31536000',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error al subir archivo a Supabase Storage:', uploadError);
        return await this.saveLocalFallback(buffer, folder, ext);
      }

      const { data: publicData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicData.publicUrl;
    } catch (storageErr) {
      console.error('Excepción al conectar con Supabase Storage:', storageErr);
      return await this.saveLocalFallback(buffer, folder, ext);
    }
  }

  /**
   * Resuelve el valor final de un campo de imagen o archivo desde FormData:
   * 1. Si viene un File nuevo con contenido, lo sube y retorna la URL.
   * 2. Si no viene archivo nuevo, revisa el campo de URL existente/externa.
   * 3. Si no hay nada, retorna null.
   */
  async resolveUploadedFile(
    formData: FormData,
    fieldName: string,
    folder: UploadFolder = 'general',
    existingFieldName = `${fieldName}Existing`,
  ): Promise<string | null> {
    const rawFile = formData.get(fieldName);

    if (rawFile && typeof rawFile === 'object' && rawFile instanceof File && rawFile.size > 0 && rawFile.name) {
      return await this.uploadFile(rawFile, { folder });
    }

    const existingUrl = formData.get(existingFieldName);
    if (typeof existingUrl === 'string' && existingUrl.trim()) {
      return existingUrl.trim();
    }

    if (typeof rawFile === 'string' && rawFile.trim()) {
      return rawFile.trim();
    }

    return null;
  }

  /**
   * Guarda el archivo localmente en public/uploads/{folder} si Supabase no está disponible
   */
  private async saveLocalFallback(buffer: Buffer, folder: string, ext: string): Promise<string> {
    const localFileName = `file_${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, localFileName), buffer);
    return `/uploads/${folder}/${localFileName}`;
  }
}

export const storageService = new StorageService();
