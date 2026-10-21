// Verifies the bearer token and makes its user ID available to protected routes.
const jwt = require('jsonwebtoken');
module.exports = function auth(req, res, next) {
  const header = req.headers.authorization || '';
  // Only accept tokens supplied using the standard Authorization scheme.
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({message: 'Authentication required.'});
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (_err) {
    return res.status(401).json({message: 'Session expired. Please log in again.'});
  }
};
