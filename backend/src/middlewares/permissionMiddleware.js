const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Check if user has permission to manage patients
 */
exports.canManagePatients = async (req, res, next) => {
  try {
    // Admins always have permission
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const permissions = await prisma.permission.findUnique({
      where: { userId: req.user.id }
    });

    if (!permissions || !permissions.canManagePatients) {
      return res.status(403).json({ 
        message: 'You do not have permission to manage patients' 
      });
    }

    next();
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Check if user has permission to manage doctors
 */
exports.canManageDoctors = async (req, res, next) => {
  try {
    // Admins always have permission
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const permissions = await prisma.permission.findUnique({
      where: { userId: req.user.id }
    });

    if (!permissions || !permissions.canManageDoctors) {
      return res.status(403).json({ 
        message: 'You do not have permission to manage doctors' 
      });
    }

    next();
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Check if user has permission to view mappings
 */
exports.canViewMappings = async (req, res, next) => {
  try {
    // Admins always have permission
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const permissions = await prisma.permission.findUnique({
      where: { userId: req.user.id }
    });

    if (!permissions || !permissions.canViewMappings) {
      return res.status(403).json({ 
        message: 'You do not have permission to view mappings' 
      });
    }

    next();
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Check if user has permission to create mappings
 */
exports.canCreateMappings = async (req, res, next) => {
  try {
    // Admins always have permission
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const permissions = await prisma.permission.findUnique({
      where: { userId: req.user.id }
    });

    if (!permissions || !permissions.canCreateMappings) {
      return res.status(403).json({ 
        message: 'You do not have permission to create mappings' 
      });
    }

    next();
  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
