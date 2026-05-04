const errorHandler = async (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "some thing went wrong";

  res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
  next();
};

export { errorHandler };
