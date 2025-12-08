export class AppError extends Error {
  public status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class TooManyError extends AppError {
  constructor(message: string) {
    super(message, 403);
  }
}
