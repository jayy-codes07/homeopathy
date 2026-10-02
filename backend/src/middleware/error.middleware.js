// Final error handler. Everything thrown inside asyncHandler lands here, so
// ApiError's statusCode and errors array reach the client consistently.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "some thing went wrong";

  res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export { errorHandler };
