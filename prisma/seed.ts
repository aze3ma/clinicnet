import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a demo clinic
  const clinic = await prisma.clinic.create({
    data: {
      name: 'Dr. Ahmed Clinic',
      subdomain: 'dr-ahmed',
      email: 'contact@drahmed.com',
      phone: '+201234567890',
      branding: {
        logo: 'https://via.placeholder.com/150',
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        font: 'Inter',
      },
      settings: {
        currency: 'EGP',
        timezone: 'Africa/Cairo',
        language: 'ar',
      },
      subscriptionPlan: 'pro',
    },
  });

  console.log(`✅ Created clinic: ${clinic.name}`);

  // Create main branch
  const branch = await prisma.branch.create({
    data: {
      clinicId: clinic.id,
      name: 'Main Branch',
      address: '123 Medical St, Cairo, Egypt',
      phone: '+201234567890',
      isMain: true,
      isOpen: true,
      timezone: 'Africa/Cairo',
      openingHours: {
        sun: [{ from: '09:00', to: '17:00' }],
        mon: [{ from: '09:00', to: '17:00' }],
        tue: [{ from: '09:00', to: '17:00' }],
        wed: [{ from: '09:00', to: '17:00' }],
        thu: [{ from: '09:00', to: '17:00' }],
        sat: [{ from: '10:00', to: '14:00' }],
      },
    },
  });

  console.log(`✅ Created branch: ${branch.name}`);

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      clinicId: clinic.id,
      email: 'admin@drahmed.com',
      passwordHash,
      firstName: 'Ahmed',
      lastName: 'Mohamed',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log(`✅ Created admin: ${admin.email}`);

  // Create doctor user + provider
  const doctorPasswordHash = await bcrypt.hash('doctor123', 10);
  const doctorUser = await prisma.user.create({
    data: {
      clinicId: clinic.id,
      email: 'doctor@drahmed.com',
      passwordHash: doctorPasswordHash,
      firstName: 'Sara',
      lastName: 'Ali',
      role: 'DOCTOR',
      isActive: true,
    },
  });

  const provider = await prisma.provider.create({
    data: {
      userId: doctorUser.id,
      branchId: branch.id,
      clinicId: clinic.id,
      specialty: 'General Medicine',
      bio: 'Experienced general practitioner with 10+ years',
      consultationFee: 200,
      currency: 'EGP',
      slotDuration: 30,
      isAcceptingPatients: true,
    },
  });

  // Add availability for doctor (Sun-Thu, 9am-5pm)
  const days = [0, 1, 2, 3, 4]; // Sun-Thu
  for (const day of days) {
    await prisma.providerAvailability.create({
      data: {
        providerId: provider.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
      },
    });
  }

  console.log(`✅ Created doctor: ${doctorUser.email}`);

  // Create demo patient
  const patient = await prisma.patient.create({
    data: {
      clinicId: clinic.id,
      phone: '+201111111111',
      email: 'patient@example.com',
      firstName: 'Mohamed',
      lastName: 'Hassan',
      gender: 'MALE',
    },
  });

  console.log(`✅ Created patient: ${patient.phone}`);

  console.log('\n🎉 Seeding completed!');
  console.log('\n📝 Login credentials:');
  console.log('Admin: admin@drahmed.com / admin123');
  console.log('Doctor: doctor@drahmed.com / doctor123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
