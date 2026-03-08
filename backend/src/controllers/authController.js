const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/db');
const { validationResult } = require('express-validator');

const BCRYPT_ROUNDS = 12;
const JWT_EXPIRY    = parseInt(process.env.JWT_EXPIRY || '86400'); // 24h default

/**
 * Helper: write to audit_log
 */
const audit = async (actorId, action, entityType, entityId, newValue, ipAddress) => {
  try {
    await pool.query(
      `INSERT INTO audit_log (actor_id, action, entity_type, entity_id, new_value, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [actorId, action, entityType, entityId, JSON.stringify(newValue), ipAddress]
    );
  } catch (err) {
    // Audit failures must not break the main request
    console.error('[Audit] Failed to write log:', err.message);
  }
};

/**
 * POST /api/auth/register
 * Creates a new user account.
 * Role defaults to 'member' unless 'owner' or 'staff' is specified.
 */
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        data:    null,
        message: 'Validation failed',
        errors:  errors.array(),
      });
    }

    const { full_name, email, password, phone, role = 'member' } = req.body;

    // Allow 'member', 'owner', and 'staff' for this development phase
    const allowedRoles = ['member', 'owner', 'staff'];
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        data:    null,
        message: 'Invalid role specified.',
        errors:  null,
      });
    }

    // Check if email is already registered
    const existing = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        data:    null,
        message: 'An account with that email already exists',
        errors:  null,
      });
    }

    // Hash the password
    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Insert the new user
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, full_name, email, role, status, created_at`,
      [full_name.trim(), email.toLowerCase().trim(), password_hash, phone || null, role]
    );

    const newUser = result.rows[0];

    // Write to audit log
    await audit(newUser.user_id, 'user.registered', 'user', newUser.user_id,
      { email: newUser.email, role: newUser.role }, req.ip);

    return res.status(201).json({
      success: true,
      data: {
        user_id:    newUser.user_id,
        full_name:  newUser.full_name,
        email:      newUser.email,
        role:       newUser.role,
        created_at: newUser.created_at,
      },
      message: 'Registration successful',
      errors:  null,
    });
  } catch (err) {
    next(err);
  }
};