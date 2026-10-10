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
    maxAge: 15, // short-lived - read once then gone
    httpOnly: false, // Accessible to client so FlashToaster can clear it without server mutations
    sameSite: 'lax',
  });
}

export async function readFlash(): Promise<FlashMessage | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(FLASH_COOKIE)?.value;
  if (!raw) return null;

  try {
    cookieStore.delete(FLASH_COOKIE);
  } catch {
    // Next.js Server Components cannot modify cookies during render.
    // FlashToaster clears the cookie on the client side.
  }

  try {
    return JSON.parse(raw) as FlashMessage;
  } catch {
    return null;
  }
}
