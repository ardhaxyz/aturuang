const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      role: 'admin',
    },
  });
  console.log('✅ Admin user created:', admin.username);

  // 2. Create Rooms
  const rooms = await Promise.all([
    prisma.room.upsert({
      where: { id: 'room-a' },
      update: {},
      create: {
        id: 'room-a',
        name: 'Ruang A - Small',
        capacity: 4,
        facilities: ['Projector', 'Whiteboard', 'AC'],
      },
    }),
    prisma.room.upsert({
      where: { id: 'room-b' },
      update: {},
      create: {
        id: 'room-b',
        name: 'Ruang B - Medium',
        capacity: 8,
        facilities: ['Projector', 'Whiteboard', 'AC', 'Video Conference'],
      },
    }),
    prisma.room.upsert({
      where: { id: 'room-c' },
      update: {},
      create: {
        id: 'room-c',
        name: 'Ruang C - Large',
        capacity: 15,
        facilities: ['Projector', 'Whiteboard', 'AC', 'Video Conference', 'Sound System'],
      },
    }),
  ]);
  console.log('✅ Rooms created:', rooms.length);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
