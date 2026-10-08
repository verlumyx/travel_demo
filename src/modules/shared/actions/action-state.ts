import { DomainError, ForbiddenError } from '@/modules/shared/exceptions/domain-error';

export type ActionState = {
  status: 'idle' | 'error';
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialActionState: ActionState = { status: 'idle' };

export function toActionError(error: unknown): ActionState {
  if (error instanceof ForbiddenError) {
    return { status: 'error', message: 'No tienes permiso para realizar esta acción.' };
  }
  if (error instanceof DomainError) {
    return { status: 'error', message: error.message };
  }
  throw error;
}
