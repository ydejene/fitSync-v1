const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
    if (isDev) console.error(err.stack);

  // Handle specific known error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      data:    null,
      message: 'Validation failed',
      errors:  err.details || err.message,
    });
  }

  return res.status(500).json({
    success: false,
    data:    null,
    message: isDev ? err.message : 'Internal server error',
    errors:  null,
  });
};

module.exports = errorHandler;
