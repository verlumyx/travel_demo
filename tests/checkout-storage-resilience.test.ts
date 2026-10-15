import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DomainError } from '@/modules/shared/exceptions/domain-error';
import { StorageService } from '@/modules/shared/services/storage.service';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

describe('Storage and Checkout Resilience', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('createSupabaseAdminClient', () => {
    it('throws DomainError when NEXT_PUBLIC_SUPABASE_URL or service key is missing', () => {
      const origUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const origKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      expect(() => createSupabaseAdminClient()).toThrowError(DomainError);

      process.env.NEXT_PUBLIC_SUPABASE_URL = origUrl;
      process.env.SUPABASE_SERVICE_ROLE_KEY = origKey;
    });
  });

  describe('StorageService', () => {
    const storageService = new StorageService();

    it('throws DomainError when file size exceeds maximum limit', async () => {
      const oversizedFile = new File(['a'.repeat(6 * 1024 * 1024)], 'large-proof.png', {
        type: 'image/png',
      });

      await expect(
        storageService.uploadFile(oversizedFile, { maxSizeBytes: 5 * 1024 * 1024 }),
      ).rejects.toThrowError(DomainError);
    });

    it('throws DomainError instead of raw EROFS in production / Vercel when Supabase is unreachable', async () => {
      const origVercel = process.env.VERCEL;
      process.env.VERCEL = '1';

      const file = new File(['proof data'], 'proof.png', { type: 'image/png' });

      // Simulate Supabase failing by passing an invalid bucket or mocking
      await expect(
        storageService.uploadFile(file, { bucket: 'non-existent-bucket-test' }),
      ).rejects.toThrowError(DomainError);

      if (origVercel !== undefined) {
        process.env.VERCEL = origVercel;
      } else {
        delete process.env.VERCEL;
      }
    });
  });
});
