const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

// Register is now disabled - only admin can create users
exports.registerUser = async (req, res) => {
  res.status(403).json({ 
    message: "Registration is disabled. Please contact admin to create your account." 
  });
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Check for default admin credentials from .env
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      // Create a special admin user object without database lookup
      const defaultAdmin = {
        id: 0, // Special ID for default admin
        username: process.env.ADMIN_USERNAME,
        firstName: "Super",
        lastName: "Admin",
        email: "admin@system.com",
        role: "ADMIN",
        isActive: true,
        contact: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
        permissions: {
          canManagePatients: true,
          canManageDoctors: true,
          canViewMappings: true,
          canCreateMappings: true
        }
      };

      const token = jwt.sign({ id: defaultAdmin.id, role: defaultAdmin.role }, process.env.JWT_SECRET, { expiresIn: "8h" });

      return res.status(200).json({ 
        message: "Login successful (Default Admin)", 
        token,
        user: defaultAdmin
      });
    }

    // Find user by username
    const user = await prisma.user.findUnique({ 
      where: { username },
      include: {
        permissions: true
      }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated. Please contact admin." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "8h" });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({ 
      message: "Login successful", 
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    // Handle default admin (ID=0) - doesn't exist in database
    if (req.user.id === 0 && req.user.role === 'ADMIN') {
      // Get system-wide stats for admin
      const totalPatients = await prisma.patient.count();
      const totalMappings = await prisma.mapping.count();
      const totalIssues = await prisma.issueRequest.count();
      
      const defaultAdmin = {
        id: 0,
        username: process.env.ADMIN_USERNAME,
        firstName: "Super",
        lastName: "Admin",
        email: "admin@system.com",
        role: "ADMIN",
        isActive: true,
        contact: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
        permissions: {
          canManagePatients: true,
          canManageDoctors: true,
          canViewMappings: true,
          canCreateMappings: true
        },
        _count: {
          patients: totalPatients,
          mappings: totalMappings,
          issueRequests: totalIssues
        }
      };
      return res.json(defaultAdmin);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        permissions: true,
        _count: {
          select: {
            patients: true,
            mappings: true,
            issueRequests: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user is admin (but not default admin), show system-wide stats
    if (user.role === 'ADMIN') {
      const totalPatients = await prisma.patient.count();
      const totalMappings = await prisma.mapping.count();
      const totalIssues = await prisma.issueRequest.count();
      
      const { password, ...userWithoutPassword } = user;
      userWithoutPassword._count = {
        patients: totalPatients,
        mappings: totalMappings,
        issueRequests: totalIssues
      };
      return res.json(userWithoutPassword);
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update own profile (limited fields)
exports.updateProfile = async (req, res) => {
  try {
    const { contact } = req.body;
    const userId = req.user.id;

    // Handle default admin (ID=0) - cannot update profile
    if (userId === 0 && req.user.role === 'ADMIN') {
      return res.status(400).json({ 
        message: 'Default admin profile cannot be updated. This is a system account.' 
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        contact: contact || null
      },
      include: {
        permissions: true,
        _count: {
          select: {
            patients: true,
            mappings: true,
            issueRequests: true
          }
        }
      }
    });

    // If user is admin, show system-wide stats
    if (updatedUser.role === 'ADMIN') {
      const totalPatients = await prisma.patient.count();
      const totalMappings = await prisma.mapping.count();
      const totalIssues = await prisma.issueRequest.count();
      
      const { password, ...userWithoutPassword } = updatedUser;
      userWithoutPassword._count = {
        patients: totalPatients,
        mappings: totalMappings,
        issueRequests: totalIssues
      };
      return res.json(userWithoutPassword);
    }

    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change own password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Handle default admin (ID=0) - cannot change password
    if (userId === 0 && req.user.role === 'ADMIN') {
      return res.status(400).json({ 
        message: 'Default admin password cannot be changed. Please update the .env file to change credentials.' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

