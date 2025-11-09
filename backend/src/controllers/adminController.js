const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

/**
 * Generate password from firstName + '123'
 */
const generatePassword = (firstName) => {
  return `${firstName}123`;
};

/**
 * Generate username from firstName and lastName
 */
const generateUsername = (firstName, lastName) => {
  const base = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
  return base.replace(/\s+/g, '');
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        permissions: true,
        creator: {
          select: { id: true, username: true, firstName: true, lastName: true }
        },
        _count: {
          select: {
            patients: true,
            mappings: true,
            issueRequests: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Remove password from response
    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json(usersWithoutPassword);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new user (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, contact, permissions, role } = req.body;
    const adminId = req.user.id;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ 
        message: 'First name, last name, and email are required' 
      });
    }

    // Validate role
    const userRole = (role && (role.toUpperCase() === 'ADMIN' || role.toUpperCase() === 'USER')) 
      ? role.toUpperCase() 
      : 'USER';

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Generate username and check uniqueness
    let username = generateUsername(firstName, lastName);
    let counter = 1;
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${generateUsername(firstName, lastName)}${counter}`;
      counter++;
    }

    // Generate password
    const generatedPassword = generatePassword(firstName);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create user with permissions
    // Note: Skip createdBy if adminId is 0 (default admin from .env)
    const userData = {
      firstName,
      lastName,
      username,
      email,
      contact: contact || null,
      password: hashedPassword,
      role: userRole,
      isActive: true,
      permissions: {
        create: {
          canManagePatients: permissions?.canManagePatients ?? true,
          canManageDoctors: permissions?.canManageDoctors ?? true,
          canViewMappings: permissions?.canViewMappings ?? true,
          canCreateMappings: permissions?.canCreateMappings ?? true
        }
      }
    };

    // Only set createdBy if admin exists in database (not the default .env admin)
    if (adminId !== 0) {
      userData.createdBy = adminId;
    }

    const user = await prisma.user.create({
      data: userData,
      include: {
        permissions: true
      }
    });

    // Remove password from response but include generated password for admin
    const { password, ...userWithoutPassword } = user;

    res.status(201).json({
      user: userWithoutPassword,
      credentials: {
        username,
        password: generatedPassword // Send plain password to admin (only once)
      },
      message: `User created successfully. Username: ${username}, Password: ${generatedPassword}`
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single user by ID (Admin only)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        permissions: true,
        creator: {
          select: { id: true, username: true, firstName: true, lastName: true }
        },
        _count: {
          select: {
            patients: true,
            mappings: true,
            issueRequests: true,
            createdUsers: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, contact, isActive, role, permissions } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is taken by another user
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email }
      });
      if (emailTaken) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Update user
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (contact !== undefined) updateData.contact = contact;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (role && (role.toUpperCase() === 'ADMIN' || role.toUpperCase() === 'USER')) {
      updateData.role = role.toUpperCase();
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        permissions: true
      }
    });

    // Update or create permissions if provided and user is not ADMIN
    if (permissions && updatedUser.role !== 'ADMIN') {
      console.log('Updating permissions for user:', parseInt(id), permissions);
      
      if (updatedUser.permissions) {
        // Update existing permissions
        await prisma.permission.update({
          where: { userId: parseInt(id) },
          data: {
            canManagePatients: permissions.canManagePatients === true,
            canManageDoctors: permissions.canManageDoctors === true,
            canViewMappings: permissions.canViewMappings === true,
            canCreateMappings: permissions.canCreateMappings === true
          }
        });
        console.log('Permissions updated successfully');
      } else {
        // Create new permissions if they don't exist
        await prisma.permission.create({
          data: {
            userId: parseInt(id),
            canManagePatients: permissions.canManagePatients === true,
            canManageDoctors: permissions.canManageDoctors === true,
            canViewMappings: permissions.canViewMappings === true,
            canCreateMappings: permissions.canCreateMappings === true
          }
        });
        console.log('Permissions created successfully');
      }
    }

    // Fetch the updated user with permissions to return fresh data
    const finalUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        permissions: true,
        creator: {
          select: { id: true, username: true, firstName: true, lastName: true }
        },
        _count: {
          select: {
            patients: true,
            mappings: true,
            issueRequests: true
          }
        }
      }
    });

    console.log('Final user with permissions:', finalUser?.permissions);

    const { password, ...userWithoutPassword } = finalUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Prevent admin from deleting themselves
    if (parseInt(id) === adminId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset user password (Admin only)
exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new password
    const newPassword = generatePassword(user.firstName);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: hashedPassword }
    });

    res.json({
      message: 'Password reset successfully',
      credentials: {
        username: user.username,
        password: newPassword
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get dashboard statistics (Admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers, 
      activeUsers, 
      adminUsersFromDb,
      regularUsers,
      totalPatients, 
      totalDoctors, 
      totalMappings, 
      pendingIssues,
      totalIssues
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.mapping.count(),
      prisma.issueRequest.count({ where: { status: 'pending' } }),
      prisma.issueRequest.count()
    ]);

    // Add 1 for the default admin (id: 0) which is not in the database
    const adminUsers = adminUsersFromDb + 1;
    
    // Adjust total users to include the default admin
    const totalUsersWithDefaultAdmin = totalUsers + 1;
    const activeUsersWithDefaultAdmin = activeUsers + 1; // Default admin is always active

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.json({
      stats: {
        totalUsers: totalUsersWithDefaultAdmin,
        activeUsers: activeUsersWithDefaultAdmin,
        inactiveUsers: totalUsersWithDefaultAdmin - activeUsersWithDefaultAdmin,
        adminUsers,
        regularUsers,
        totalPatients,
        totalDoctors,
        totalMappings,
        pendingIssues,
        totalIssues
      },
      recentUsers
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get patients for a specific user (Admin only)
exports.getUserPatients = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all patients created by this user
    const patients = await prisma.patient.findMany({
      where: { createdBy: userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(patients);
  } catch (error) {
    console.error('Get user patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all patients (Admin only) - for Patients Management
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform to include user info directly
    const patientsWithUser = patients.map(patient => ({
      ...patient,
      userName: `${patient.user.firstName} ${patient.user.lastName}`,
      userUsername: patient.user.username
    }));

    res.json(patientsWithUser);
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all doctors (Admin only) - for Doctors Management
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        _count: {
          select: {
            mappings: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(doctors);
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all mappings (Admin only) - for Mappings Management
exports.getAllMappings = async (req, res) => {
  try {
    const mappings = await prisma.mapping.findMany({
      include: {
        patient: true,
        doctor: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform to include user info directly
    const mappingsWithUser = mappings.map(mapping => ({
      ...mapping,
      userName: mapping.user ? `${mapping.user.firstName} ${mapping.user.lastName}` : 'N/A',
      userUsername: mapping.user ? mapping.user.username : 'N/A'
    }));

    res.json(mappingsWithUser);
  } catch (error) {
    console.error('Get all mappings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get mappings for a specific user (Admin only)
exports.getUserMappings = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all mappings created by this user
    const mappings = await prisma.mapping.findMany({
      where: { createdBy: userId },
      include: {
        patient: true,
        doctor: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(mappings);
  } catch (error) {
    console.error('Get user mappings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};;
