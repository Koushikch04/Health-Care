export class AppError extends Error {
  constructor(statusCode, message, options = {}) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = options.code || "APP_ERROR";
    this.details = options.details;
    this.isOperational = true;
  }
}

export const createAppError = (statusCode, message, options = {}) => {
  return new AppError(statusCode, message, options);
};
