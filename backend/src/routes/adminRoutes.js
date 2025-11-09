const express = require('express');
const {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  resetUserPassword,
  getDashboardStats,
  getUserPatients,
  getAllPatients,
  getAllDoctors,
  getAllMappings,
  getUserMappings
} = require('../controllers/adminController');
const authenticate = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/adminMiddleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate, isAdmin);

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.get('/users/:id/patients', getUserPatients);
router.get('/users/:id/mappings', getUserMappings);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/reset-password', resetUserPassword);

// Patients Management - All patients across all users
router.get('/patients', getAllPatients);

// Doctors Management - All doctors
router.get('/doctors', getAllDoctors);

// Mappings Management - All mappings across all users
router.get('/mappings', getAllMappings);

module.exports = router;
