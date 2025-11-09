const express = require('express');
const {
  createMapping,
  getMappings,
  getDoctorsForPatient,
  updateMapping,
  deleteMapping
} = require('../controllers/mappingController');
const authenticate = require('../middlewares/authMiddleware');
const { canViewMappings, canCreateMappings } = require('../middlewares/permissionMiddleware');

const router = express.Router();

router.post('/', authenticate, canCreateMappings, createMapping);
router.get('/', authenticate, canViewMappings, getMappings);
router.get('/:patientId', authenticate, canViewMappings, getDoctorsForPatient);
router.put('/:id', authenticate, canCreateMappings, updateMapping); 
router.delete('/:id', authenticate, canCreateMappings, deleteMapping);

module.exports = router;
