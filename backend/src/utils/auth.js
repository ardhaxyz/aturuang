const jwt = require('jsonwebtoken');

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRY = '24h';

/**
 * Generate JWT Token
 * @param {Object} payload - User data payload
 * @returns {string} JWT Token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify JWT Token
 * @param {string} token - JWT Token
 * @returns {Object} Decoded payload
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Authentication Middleware
 * Validates JWT token from Authorization header
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
    });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
}

/**
 * Role-based access control middleware
 * Checks if user has one of the allowed roles
 * @param {...string} allowedRoles - Allowed roles
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }
    next();
  };
}

/**
 * Superadmin middleware
 */
function requireSuperadmin(req, res, next) {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Superadmin access required',
    });
  }
  next();
}

/**
 * Admin middleware (superadmin or org_admin)
 */
function requireAdmin(req, res, next) {
  if (!['superadmin', 'org_admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
  next();
}

/**
 * Organization access middleware
 * Checks if user can access resources for a specific organization
 */
function requireOrgAccess(req, res, next) {
  const { organizationId } = req.params;
  const user = req.user;

  // Superadmin can access all organizations
  if (user.role === 'superadmin') {
    return next();
  }

  // User must belong to the organization
  if (user.organizationId !== organizationId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied for this organization',
    });
  }

  next();
}

/**
 * Legacy requireAdmin (kept for backward compatibility)
 * @deprecated Use requireRole or requireAdmin instead
 */
function requireAdminLegacy(req, res, next) {
  if (!['superadmin', 'org_admin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
  requireRole,
  requireSuperadmin,
  requireAdmin,
  requireOrgAccess,
  requireAdminLegacy,
};
