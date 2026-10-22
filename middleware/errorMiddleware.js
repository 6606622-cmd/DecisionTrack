
const errorMiddleware = (err, req, res, next) => {
  let statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  let message = err.message || "Internal Server Error";

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }

  // Invalid MongoDB document ID
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID or data format";
  }

  // Duplicate field errors
  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists";
  }

  // Invalid JSON request body
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "Invalid JSON request body";
  }

  console.error(`[${statusCode}] ${req.method} ${req.originalUrl}: ${message}`);

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorMiddleware;
