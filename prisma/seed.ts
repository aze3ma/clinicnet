import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============================================
  // 1. CREATE CLINIC
  // ============================================
  const clinic = await prisma.clinic.create({
    data: {
      name: 'Dr. Ahmed Medical Center',
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
      subscriptionEndsAt: new Date('2025-12-31'),
    },
  });

  console.log(`✅ Created clinic: ${clinic.name}`);

  // ============================================
  // 2. CREATE BRANCHES
  // ============================================
  const mainBranch = await prisma.branch.create({
    data: {
      clinicId: clinic.id,
      name: 'Main Branch - Nasr City',
      address: '123 Abbas El Akkad St, Nasr City, Cairo, Egypt',
      phone: '+201234567890',
      email: 'nasrcity@drahmed.com',
      latitude: 30.0444,
      longitude: 31.2357,
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

  const secondBranch = await prisma.branch.create({
    data: {
      clinicId: clinic.id,
      name: 'Maadi Branch',
      address: '45 Road 9, Maadi, Cairo, Egypt',
      phone: '+201234567891',
      email: 'maadi@drahmed.com',
      latitude: 29.9602,
      longitude: 31.2569,
      isMain: false,
      isOpen: true,
      timezone: 'Africa/Cairo',
      openingHours: {
        sun: [{ from: '10:00', to: '18:00' }],
        mon: [{ from: '10:00', to: '18:00' }],
        wed: [{ from: '10:00', to: '18:00' }],
        thu: [{ from: '10:00', to: '18:00' }],
        sat: [{ from: '10:00', to: '14:00' }],
      },
    },
  });

  console.log(`✅ Created branches: ${mainBranch.name}, ${secondBranch.name}`);

  // ============================================
  // 3. CREATE USERS (STAFF)
  // ============================================

  // Admin User
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      clinicId: clinic.id,
      email: 'admin@drahmed.com',
      passwordHash: adminPasswordHash,
      firstName: 'Ahmed',
      lastName: 'Mohamed',
      phone: '+201111111111',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log(`✅ Created admin: ${admin.email}`);

  // Doctor 1 User
  const doctor1PasswordHash = await bcrypt.hash('doctor123', 10);
  const doctor1User = await prisma.user.create({
    data: {
      clinicId: clinic.id,
      email: 'sara.ali@drahmed.com',
      passwordHash: doctor1PasswordHash,
      firstName: 'Sara',
      lastName: 'Ali',
      phone: '+201222222222',
      role: 'DOCTOR',
      isActive: true,
    },
  });

  // Doctor 2 User
  const doctor2PasswordHash = await bcrypt.hash('doctor123', 10);
  const doctor2User = await prisma.user.create({
    data: {
      clinicId: clinic.id,
      email: 'omar.hassan@drahmed.com',
      passwordHash: doctor2PasswordHash,
      firstName: 'Omar',
      lastName: 'Hassan',
      phone: '+201333333333',
      role: 'DOCTOR',
      isActive: true,
    },
  });

  // Reception User
  const receptionPasswordHash = await bcrypt.hash('reception123', 10);
  const reception = await prisma.user.create({
    data: {
      clinicId: clinic.id,
      email: 'reception@drahmed.com',
      passwordHash: receptionPasswordHash,
      firstName: 'Fatima',
      lastName: 'Ibrahim',
      phone: '+201444444444',
      role: 'RECEPTION',
      isActive: true,
    },
  });

  console.log(
    `✅ Created users: doctors (${doctor1User.email}, ${doctor2User.email}), reception (${reception.email})`,
  );

  // ============================================
  // 4. CREATE PROVIDERS (DOCTORS)
  // ============================================

  // Provider 1 - General Medicine
  const provider1 = await prisma.provider.create({
    data: {
      userId: doctor1User.id,
      branchId: mainBranch.id,
      specialty: 'General Medicine',
      bio: 'Experienced general practitioner with 10+ years of experience in family medicine and preventive care.',
      consultationFee: 250.0,
      currency: 'EGP',
      slotDuration: 30,
      isAcceptingPatients: true,
      settings: {
        bufferTime: 5,
        autoConfirm: true,
        allowOnlineBooking: true,
      },
    },
  });

  // Provider 2 - Pediatrics
  const provider2 = await prisma.provider.create({
    data: {
      userId: doctor2User.id,
      branchId: secondBranch.id,
      specialty: 'Pediatrics',
      bio: 'Specialized in child healthcare and development. Board certified pediatrician.',
      consultationFee: 300.0,
      currency: 'EGP',
      slotDuration: 20,
      isAcceptingPatients: true,
      settings: {
        bufferTime: 10,
        autoConfirm: false,
        allowOnlineBooking: true,
      },
    },
  });

  console.log(
    `✅ Created providers: ${provider1.specialty}, ${provider2.specialty}`,
  );

  // ============================================
  // 5. CREATE PROVIDER AVAILABILITY
  // ============================================

  // Provider 1 Availability (Sun-Thu, 9am-5pm)
  const days1 = [0, 1, 2, 3, 4]; // Sun-Thu
  for (const day of days1) {
    await prisma.providerAvailability.create({
      data: {
        providerId: provider1.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
      },
    });
  }

  // Provider 2 Availability (Sun, Mon, Wed, Thu, Sat)
  const days2 = [0, 1, 3, 4, 6];
  for (const day of days2) {
    await prisma.providerAvailability.create({
      data: {
        providerId: provider2.id,
        dayOfWeek: day,
        startTime: day === 6 ? '10:00' : '10:00',
        endTime: day === 6 ? '14:00' : '18:00',
        isActive: true,
      },
    });
  }

  console.log(`✅ Created provider availability schedules`);

  // ============================================
  // 6. CREATE PATIENTS
  // ============================================

  const patient1 = await prisma.patient.create({
    data: {
      clinicId: clinic.id,
      phone: '+201555555555',
      email: 'mohamed.hassan@example.com',
      firstName: 'Mohamed',
      lastName: 'Hassan',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'MALE',
      bloodType: 'O+',
      allergies: 'Penicillin',
      medicalHistory: {
        conditions: ['Hypertension'],
        surgeries: [],
        medications: ['Lisinopril 10mg'],
      },
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      clinicId: clinic.id,
      phone: '+201666666666',
      email: 'nour.ahmed@example.com',
      firstName: 'Nour',
      lastName: 'Ahmed',
      dateOfBirth: new Date('1985-08-22'),
      gender: 'FEMALE',
      bloodType: 'A+',
      medicalHistory: {
        conditions: ['Asthma'],
        surgeries: ['Appendectomy 2015'],
        medications: ['Ventolin inhaler'],
      },
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      clinicId: clinic.id,
      phone: '+201777777777',
      firstName: 'Youssef',
      lastName: 'Ali',
      dateOfBirth: new Date('2018-03-10'),
      gender: 'MALE',
      bloodType: 'B+',
    },
  });

  console.log(
    `✅ Created patients: ${patient1.firstName}, ${patient2.firstName}, ${patient3.firstName}`,
  );

  // ============================================
  // 7. CREATE APPOINTMENTS
  // ============================================

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const appointment1 = await prisma.appointment.create({
    data: {
      clinicId: clinic.id,
      branchId: mainBranch.id,
      providerId: provider1.id,
      patientId: patient1.id,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 30 * 60000),
      duration: 30,
      status: 'CONFIRMED',
      reason: 'Regular checkup',
      notes: 'Patient requested blood pressure monitoring',
    },
  });

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(14, 0, 0, 0);

  const appointment2 = await prisma.appointment.create({
    data: {
      clinicId: clinic.id,
      branchId: secondBranch.id,
      providerId: provider2.id,
      patientId: patient3.id,
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 20 * 60000),
      duration: 20,
      status: 'SCHEDULED',
      reason: 'Vaccination',
      patientNotes: 'Child is nervous about needles',
    },
  });

  console.log(
    `✅ Created appointments: ${appointment1.id}, ${appointment2.id}`,
  );

  // ============================================
  // 8. CREATE INVOICES
  // ============================================

  const invoice1 = await prisma.invoice.create({
    data: {
      clinicId: clinic.id,
      appointmentId: appointment1.id,
      amount: 250.0,
      currency: 'EGP',
      paymentStatus: 'PAID',
      paymentMethod: 'cash',
      paidAt: new Date(),
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      clinicId: clinic.id,
      appointmentId: appointment2.id,
      amount: 300.0,
      currency: 'EGP',
      paymentStatus: 'PENDING',
    },
  });

  console.log(`✅ Created invoices: ${invoice1.id}, ${invoice2.id}`);

  // ============================================
  // 9. CREATE OTP CODES (for testing)
  // ============================================

  const otpExpiry = new Date();
  otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

  await prisma.otpCode.create({
    data: {
      phone: '+201555555555',
      code: '123456',
      expiresAt: otpExpiry,
      attempts: 0,
    },
  });

  console.log(`✅ Created OTP code for testing`);

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📝 Login credentials:');
  console.log('━'.repeat(50));
  console.log('Admin:      admin@drahmed.com / admin123');
  console.log('Doctor 1:   sara.ali@drahmed.com / doctor123');
  console.log('Doctor 2:   omar.hassan@drahmed.com / doctor123');
  console.log('Reception:  reception@drahmed.com / reception123');
  console.log('━'.repeat(50));
  console.log('\n📊 Database Summary:');
  console.log(`   Clinics: 1`);
  console.log(`   Branches: 2`);
  console.log(`   Staff: 4 (1 admin, 2 doctors, 1 reception)`);
  console.log(`   Providers: 2`);
  console.log(`   Patients: 3`);
  console.log(`   Appointments: 2`);
  console.log(`   Invoices: 2`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
