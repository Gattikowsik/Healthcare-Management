const express = require('express');
const {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctorController');
const authenticate = require('../middlewares/authMiddleware');
const { canManageDoctors } = require('../middlewares/permissionMiddleware');

const router = express.Router();

router.post('/', authenticate, canManageDoctors, createDoctor);
router.get('/', authenticate, getDoctors);
router.get('/:id', authenticate, getDoctorById);
router.put('/:id', authenticate, canManageDoctors, updateDoctor);
router.delete('/:id', authenticate, canManageDoctors, deleteDoctor);

module.exports = router;
