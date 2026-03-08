const jwt = require('jsonwebtoken');


const authenticate = (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        data:    null,
        message: 'Authentication required. No token provided.',
        errors:  null,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      data:    null,
      message: 'Invalid or expired token',
      errors:  null,
    });
  }
};
