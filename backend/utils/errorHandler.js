module.exports = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  const message = err.message || "Internal server error";

  console.error(err);

  res.status(statusCode).json({
    status,
    message,
  });
};