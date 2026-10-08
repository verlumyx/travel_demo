import 'server-only';
import { cookies } from 'next/headers';

export type FlashType = 'success' | 'error' | 'info' | 'warning';

export interface FlashMessage {
  type: FlashType;
  message: string;
}

const FLASH_COOKIE = '__flash';

export async function setFlash(type: FlashType, message: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(FLASH_COOKIE, JSON.stringify({ type, message }), {
    path: '/',
    maxAge: 10, // short-lived — read once then gone
    httpOnly: true,
    sameSite: 'lax',
  });
}

export async function readFlash(): Promise<FlashMessage | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(FLASH_COOKIE)?.value;
  if (!raw) return null;

  cookieStore.delete(FLASH_COOKIE);
  try {
    return JSON.parse(raw) as FlashMessage;
  } catch {
    return null;
  }
}
