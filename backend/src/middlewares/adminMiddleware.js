const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware to check if user is an admin
 * Must be used after authenticate middleware
 */
const isAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated (set by authenticate middleware)
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Special case: Default admin from .env (ID 0)
    if (req.user.id === 0 && req.user.role === 'ADMIN') {
      return next();
    }

    // Fetch user from database to check role
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, role: true, isActive: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // User is admin, continue
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = isAdmin;
