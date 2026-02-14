import { AppError } from "../utils/appError.js";

export const notFoundHandler = (req, res, next) => {
  return next(
    new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`, {
      code: "ROUTE_NOT_FOUND",
    })
  );
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const isAppError = err instanceof AppError;
  const statusCode = isAppError
    ? err.statusCode
    : err.name === "MulterError"
      ? 400
      : 500;

  const payload = {
    success: false,
    error: {
      code: isAppError ? err.code : "INTERNAL_SERVER_ERROR",
      message: isAppError ? err.message : "Internal server error",
      path: req.originalUrl,
      method: req.method,
    },
  };

  if (isAppError && err.details) {
    payload.error.details = err.details;
  }

  if (!isAppError && process.env.NODE_ENV !== "production") {
    payload.error.details = err.message;
  }

  return res.status(statusCode).json(payload);
};
