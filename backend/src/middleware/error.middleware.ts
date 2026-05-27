import { Request, Response, NextFunction } from "express";

/**
 * Custom application error with HTTP status code support.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/** 400 Bad Request */
export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}

/** 401 Unauthorized */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

/** 403 Forbidden */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

/** 404 Not Found */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

/** 409 Conflict */
export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

/** 429 Too Many Requests */
export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests, please try again later") {
    super(message, 429);
  }
}

/**
 * Global Express error handler middleware.
 * Must be registered LAST with app.use().
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError && err.isOperational
      ? err.message
      : "Internal server error";

  // Log unexpected errors in full
  if (!(err instanceof AppError) || !err.isOperational) {
    console.error("[UNHANDLED ERROR]", err);
  }

  res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
    },
  });
}
