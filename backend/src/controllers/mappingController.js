const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

//Assign a doctor to a patient
exports.createMapping = async (req, res) => {
  try {
    const { patientId, doctorId } = req.body;
    const userId = req.user.id;

    if (!patientId || !doctorId) {
      return res.status(400).json({ message: 'patientId and doctorId are required' });
    }

    const mapping = await prisma.mapping.create({
      data: { 
        patientId: parseInt(patientId), 
        doctorId: parseInt(doctorId),
        createdBy: userId
      },
      include: {
        patient: true,
        doctor: true,
        user: { 
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            username: true,
            email: true 
          } 
        }
      }
    });

    res.status(201).json(mapping);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//Get all mappings
exports.getMappings = async (req, res) => {
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
            username: true,
            email: true 
          } 
        }
      }
    });
    
    res.json(mappings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//Get all doctors for a patient
exports.getDoctorsForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const mappings = await prisma.mapping.findMany({
      where: { patientId: parseInt(patientId) },
      include: { doctor: true }
    });

    res.json(mappings.map(m => m.doctor));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//Update a mapping
exports.updateMapping = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({ message: 'doctorId is required' });
    }

    const updatedMapping = await prisma.mapping.update({
      where: { id: parseInt(id) },
      data: { doctorId: parseInt(doctorId) },
      include: { 
        patient: true, 
        doctor: true,
        user: { 
          select: { 
            id: true, 
            firstName: true, 
            lastName: true, 
            username: true,
            email: true 
          } 
        }
      }
    });

    res.json(updatedMapping);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//Remove a mapping
exports.deleteMapping = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.mapping.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Mapping deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
