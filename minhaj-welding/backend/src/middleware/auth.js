/**
 * MINHAJ WELDING - Auth Middleware
 * Phase 1: attaches req.user if a valid token is present, but does NOT
 * block requests without one (single-owner tool running on a private PC
 * behind Cloudflare Tunnel). Phase 3 (Roles & Permissions) will add
 * `requireAuth` and `requireRole(...)` middlewares that actually enforce
 * this on every route.
 */
const jwt = require('jsonwebtoken');

function attachUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET || 'minhaj-welding-dev-secret-CHANGE-ME');
    } catch (e) {
      // invalid/expired token - proceed unauthenticated (Phase 1 behaviour)
    }
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { attachUser, requireAuth, requireRole };
