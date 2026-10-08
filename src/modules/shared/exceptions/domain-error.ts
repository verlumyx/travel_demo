/** Base class for domain errors. Module exceptions extend this. */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
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
