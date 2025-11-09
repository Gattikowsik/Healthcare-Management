const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Add patient
exports.addPatient = async (req, res) => {
  const { name, age, disease } = req.body;
  const userId = req.user.id;

  try {
    const patient = await prisma.patient.create({
      data: { 
        name, 
        age: parseInt(age), 
        disease, 
        createdBy: userId 
      },
    });
    res.status(201).json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all patients of logged-in user
exports.getPatients = async (req, res) => {
  const userId = req.user.id;

  try {
    const patients = await prisma.patient.findMany({ where: { createdBy: userId } });
    res.status(200).json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get patient by ID
exports.getPatientById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const patient = await prisma.patient.findFirst({ where: { id: Number(id), createdBy: userId } });
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.status(200).json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update patient
exports.updatePatient = async (req, res) => {
  const { id } = req.params;
  const { name, age, disease } = req.body;
  const userId = req.user.id;

  try {
    const updated = await prisma.patient.updateMany({
      where: { id: Number(id), createdBy: userId },
      data: { 
        name, 
        age: parseInt(age), 
        disease 
      },
    });
    if (updated.count === 0) return res.status(404).json({ message: "Patient not found" });
    res.status(200).json({ message: "Patient updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete patient
exports.deletePatient = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const deleted = await prisma.patient.deleteMany({ where: { id: Number(id), createdBy: userId } });
    if (deleted.count === 0) return res.status(404).json({ message: "Patient not found" });
    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
