const express = require("express");
const router = express.Router();
const {
  addPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient
} = require("../controllers/patientController");

const authenticate = require("../middlewares/authMiddleware");
const { canManagePatients } = require("../middlewares/permissionMiddleware");

router.post("/", authenticate, canManagePatients, addPatient);
router.get("/", authenticate, getPatients);
router.get("/:id", authenticate, getPatientById);
router.put("/:id", authenticate, canManagePatients, updatePatient);
router.delete("/:id", authenticate, canManagePatients, deletePatient);

module.exports = router;
