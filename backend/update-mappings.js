const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateOldMappings() {
  try {
    // Get the first user (admin) from database
    const firstUser = await prisma.user.findFirst({
      orderBy: { id: 'asc' }
    });

    if (!firstUser) {
      console.log('No users found in database. Please create a user first.');
      return;
    }

    console.log(`Found user: ${firstUser.name} (ID: ${firstUser.id})`);

    // Update all mappings with null createdBy
    const result = await prisma.mapping.updateMany({
      where: {
        createdBy: null
      },
      data: {
        createdBy: firstUser.id
      }
    });

    console.log(`✅ Updated ${result.count} mappings to be created by ${firstUser.name}`);
    
    // Show all mappings
    const allMappings = await prisma.mapping.findMany({
      include: {
        user: { select: { name: true } },
        patient: { select: { name: true } },
        doctor: { select: { name: true } }
      }
    });

    console.log('\n📋 All mappings:');
    allMappings.forEach(m => {
      console.log(`  - ${m.patient.name} → ${m.doctor.name} (Created by: ${m.user?.name || 'Unknown'})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateOldMappings();
