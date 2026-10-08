/** Base class for domain errors. Module exceptions extend this. */
export class DomainError extends Error {
  public readonly code?: string;
  public readonly details?: any;

  constructor(message: string, code?: string, details?: any) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.details = details;
  }
}

/** Thrown when a required entity is not found. */
export class NotFoundError extends DomainError {
  constructor(message = 'Recurso no encontrado.') {
    super(message);
    this.name = 'NotFoundError';
  }
}

/** Thrown when the user lacks the required permission. */
export class ForbiddenError extends DomainError {
  constructor(action?: string) {
    super(action ? `Permiso denegado: ${action}` : 'Permiso denegado.');
    this.name = 'ForbiddenError';
  }
}
