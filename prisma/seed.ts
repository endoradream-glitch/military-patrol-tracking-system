import { db } from '@/lib/db';

async function seed() {
  console.log('🌱 Starting database seed...');

  // Create default HQ
  const hq = await db.hQ.upsert({
    where: { code: '8993' },
    update: {},
    create: {
      name: 'HQ Command Center',
      code: '8993',
      displayName: 'HQ Command Center',
      isActive: true,
      isApproved: true,
    },
  });

  console.log('✅ HQ created:', hq.name);

  // Create default camp
  const camp = await db.camp.upsert({
    where: { id: 'camp-1' },
    update: {},
    create: {
      id: 'camp-1',
      name: 'Base Camp Alpha',
      unit: '10th Division',
      hqId: hq.id,
      latitude: 40.7128,
      longitude: -74.0060,
      description: 'Main base camp',
    },
  });

  console.log('✅ Camp created:', camp.name);

  // Create default patrol
  const patrol = await db.patrol.upsert({
    where: { code: '1526' },
    update: {},
    create: {
      code: '1526',
      name: 'Patrol Unit Alpha',
      campId: camp.id,
      hqId: hq.id,
      unit: '10th Division',
      strength: 4,
      status: 'idle',
    },
  });

  console.log('✅ Patrol created:', patrol.name);

  // Create subscription plans
  const plans = [
    {
      name: '72 hours - Basic',
      description: 'Basic 72-hour patrol tracking',
      price: 0,
      durationDays: 3,
      features: JSON.stringify([
        'Real-time GPS tracking',
        'SOS alerts',
        'Basic reporting'
      ]),
    },
    {
      name: '72 hours - Pro',
      description: 'Professional 72-hour patrol tracking',
      price: 9.99,
      durationDays: 3,
      features: JSON.stringify([
        'Real-time GPS tracking',
        'SOS alerts',
        'Video/audio calls',
        'Advanced reporting',
        'Historical data'
      ]),
    },
    {
      name: '30 Days - Pro',
      description: 'Monthly professional tracking',
      price: 49.99,
      durationDays: 30,
      features: JSON.stringify([
        'Real-time GPS tracking',
        'SOS alerts',
        'Video/audio calls',
        'Advanced reporting',
        'Historical data',
        'Priority support'
      ]),
    },
    {
      name: '1 Year - Enterprise',
      description: 'Annual enterprise solution',
      price: 499.99,
      durationDays: 365,
      features: JSON.stringify([
        'Real-time GPS tracking',
        'SOS alerts',
        'Video/audio calls',
        'Advanced reporting',
        'Historical data',
        'Priority support',
        'Unlimited patrols',
        'Custom integrations'
      ]),
    },
  ];

  for (const plan of plans) {
    await db.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    });
  }

  console.log('✅ Subscription plans created');

  // Create default Super Admin
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const superAdmin = await db.superAdmin.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      password: hashedPassword,
      name: 'Super Administrator',
      email: 'admin@military.patrol',
      isActive: true,
    },
  });

  console.log('✅ Super Admin created:', superAdmin.username);
  console.log('   Default password: admin123');
  console.log('   ⚠️  Remember to change this in production!');

  console.log('🎉 Seeding complete!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
