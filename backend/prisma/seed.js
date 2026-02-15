const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Check if database already has users
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log('⚠️  Database already contains users. Skipping seed.');
    console.log('💡 Use the setup endpoint (/api/setup) to create the initial superadmin.');
    return;
  }

  // Create sample organization
  const organization = await prisma.organization.create({
    data: {
      name: 'Coordinating Ministry for Food Affairs',
      description: 'Government organization for food coordination',
      isActive: true,
    },
  });
  console.log('✅ Organization created:', organization.name);

  // Create sample rooms (public and private)
  const rooms = await Promise.all([
    // Public room
    prisma.room.create({
      data: {
        name: 'Ruang Rapat Utama',
        capacity: 20,
        facilities: JSON.stringify(['Projector', 'Whiteboard', 'AC', 'Video Conference', 'Sound System']),
        isPublic: true,
        isActive: true,
      },
    }),
    // Organization rooms
    prisma.room.create({
      data: {
        name: 'Ruang A - Small',
        capacity: 4,
        facilities: JSON.stringify(['Projector', 'Whiteboard', 'AC']),
        isPublic: false,
        isActive: true,
        organizationId: organization.id,
      },
    }),
    prisma.room.create({
      data: {
        name: 'Ruang B - Medium',
        capacity: 8,
        facilities: JSON.stringify(['Projector', 'Whiteboard', 'AC', 'Video Conference']),
        isPublic: false,
        isActive: true,
        organizationId: organization.id,
      },
    }),
    prisma.room.create({
      data: {
        name: 'Ruang C - Large',
        capacity: 15,
        facilities: JSON.stringify(['Projector', 'Whiteboard', 'AC', 'Video Conference', 'Sound System']),
        isPublic: false,
        isActive: true,
        organizationId: organization.id,
      },
    }),
  ]);
  console.log('✅ Rooms created:', rooms.length);

  console.log('');
  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('   1. Start the server');
  console.log('   2. Visit: POST http://localhost:3001/api/setup');
  console.log('   3. Create your superadmin account');
  console.log('   4. Login and start managing your organization!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
