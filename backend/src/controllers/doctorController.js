const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

//Add Doctor
exports.createDoctor = async (req, res) => {
  try {
    const { name, specialty, experience, contact } = req.body;

    if (!name || !specialty) {
      return res.status(400).json({ message: 'Name and specialty are required' });
    }

    const doctor = await prisma.doctor.create({
      data: { 
        name, 
        specialty,
        experience: experience ? parseInt(experience) : 0,
        contact: contact || ''
      }
    });

    res.status(201).json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//Get All Doctors
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany();
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//Get Doctor by ID
exports.getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(id) }
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//Update Doctor
exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialty, experience, contact } = req.body;

    const doctor = await prisma.doctor.update({
      where: { id: parseInt(id) },
      data: { 
        name, 
        specialty,
        experience: experience ? parseInt(experience) : 0,
        contact: contact || ''
      }
    });

    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//Delete Doctor
exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.doctor.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
