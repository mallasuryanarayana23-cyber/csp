import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Create Default Academy School
  const school = await prisma.school.upsert({
    where: { name: 'Default Academy' },
    update: {},
    create: {
      name: 'Default Academy',
      address: '123 Neural Way, Brain City',
    },
  });
  console.log(`School verified/created: ${school.name}`);

  // 2. Hash Password
  const passwordHash = await bcrypt.hash('password123', 10);

  // 3. Create Demo Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@neurolearn.com' },
    update: {},
    create: {
      email: 'admin@neurolearn.com',
      name: 'Dr. Sarah Carter (Admin)',
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log(`Admin user created: ${admin.email}`);

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@neurolearn.com' },
    update: {},
    create: {
      email: 'teacher@neurolearn.com',
      name: 'Professor Marcus Vance',
      passwordHash,
      role: 'TEACHER',
    },
  });
  console.log(`Teacher user created: ${teacher.email}`);

  const parent = await prisma.user.upsert({
    where: { email: 'parent@neurolearn.com' },
    update: {},
    create: {
      email: 'parent@neurolearn.com',
      name: 'Helen Sterling (Parent)',
      passwordHash,
      role: 'PARENT',
    },
  });
  console.log(`Parent user created: ${parent.email}`);

  // For Student, we need to create the User and associate a StudentProfile
  let studentUser = await prisma.user.findUnique({
    where: { email: 'student@neurolearn.com' },
  });

  if (!studentUser) {
    studentUser = await prisma.user.create({
      data: {
        email: 'student@neurolearn.com',
        name: 'Leo Sterling',
        passwordHash,
        role: 'STUDENT',
        studentProfile: {
          create: {
            grade: '4th Grade',
            focusScore: 92,
            streakDays: 5,
            schoolId: school.id,
            parentId: parent.id, // Linked to the demo parent
          },
        },
      },
    });
    console.log(`Student user & profile created: ${studentUser.email}`);
  } else {
    // Make sure profile exists
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: studentUser.id },
    });
    if (!profile) {
      await prisma.studentProfile.create({
        data: {
          grade: '4th Grade',
          focusScore: 92,
          streakDays: 5,
          userId: studentUser.id,
          schoolId: school.id,
          parentId: parent.id,
        },
      });
      console.log('Student profile restored for existing student user.');
    }
  }

  // Retrieve student profile for seeding some starting metrics & achievements
  const student = await prisma.user.findUnique({
    where: { email: 'student@neurolearn.com' },
    include: { studentProfile: true },
  });
  const studentProfileId = student?.studentProfile?.id;

  if (studentProfileId) {
    // Seed some badges for the student if none exist
    const badgeCount = await prisma.badge.count({ where: { studentId: studentProfileId } });
    if (badgeCount === 0) {
      await prisma.badge.createMany({
        data: [
          { studentId: studentProfileId, name: 'Typing Wizard', icon: 'keyboard' },
          { studentId: studentProfileId, name: 'Focus Champion', icon: 'zap' },
          { studentId: studentProfileId, name: 'First Milestone', icon: 'award' },
        ],
      });
      console.log('Badges seeded for student.');
    }

    // Seed an initial AI Report if none exists
    const reportCount = await prisma.aIReport.count({ where: { studentId: studentProfileId } });
    if (reportCount === 0) {
      const initialReport = await prisma.aIReport.create({
        data: {
          studentId: studentProfileId,
          dyslexiaRisk: 'MEDIUM',
          dyslexiaProb: 48,
          adhdRisk: 'LOW',
          adhdProb: 24,
          cognitiveStress: 'LOW',
          speechFluencyScore: 82,
          typingRhythmConsistency: 74,
          attentionSpanMin: 4.5,
          recommendations: JSON.stringify([
            'Encourage reading using high-spacing themes or OpenDyslexic overlays.',
            'Introduce 2-minute visual calibration focus breaks between typing tests.',
            'Practice phonological segmenting exercises.'
          ]),
          teacherNotes: 'Leo shows strong comprehension but gets slightly fatigued during prolonged reading. OpenDyslexic font helps him keep his tracking lines.',
        },
      });

      // Explainability logs for this report
      await prisma.explainabilityLog.create({
        data: {
          aiReportId: initialReport.id,
          aiModelVersion: 'ensemble-v2.0',
          predictionType: 'DYSLEXIA',
          confidenceScore: 0.48,
          explanationText: 'Mild letter hesitations observed on keys b, d, p, q. Slower rhythm consistency triggers a medium probability of dyslexic reading patterns.',
          featureWeights: JSON.stringify({ keyDwellVariance: 0.35, speechPhonemeDelay: 0.28, gazeVarianceX: 0.15 }),
        },
      });
      console.log('Initial AI report and explainability logs seeded.');
    }
  }

  // 4. Seed 5 Diverse Reading Tests
  const tests = [
    {
      title: 'Space Adventure Reading Test',
      category: 'Dyslexia Screening',
      text: 'Once upon a time, in a galaxy far away, a brave astronaut named Leo boarded his shiny spaceship. He was going to find a hidden planet filled with magical glowing crystals. His robot, Sparky, sat next to him, beeping happily. Together they sailed through a sea of stars.',
      difficulty: 'Easy',
      estimatedTime: 60,
    },
    {
      title: 'The Clockwork Forest',
      category: 'Dyslexia Screening',
      text: 'Deep inside the mysterious valley of Eldoria, trees made of bronze and copper tick like grandfather clocks. Tiny brass birds flutter between golden leaves, singing sweet metallic melodies. The forest floor is covered in a soft layer of pine-scented gear teeth and silver screws. Adventurers must listen carefully to the gears to find the golden path.',
      difficulty: 'Medium',
      estimatedTime: 90,
    },
    {
      title: 'Mindfulness and Focus Challenge',
      category: 'ADHD Assessment',
      text: 'Focus is the art of directing your conscious attention towards a single sensation or thought. In this assessment, please sit quietly and track the flow of words carefully. Observe how your mind may wander to external noises, thoughts of tomorrow, or minor details on the screen. Maintaining deep attention requires gentle persistence, returning to the text whenever a distraction arises.',
      difficulty: 'Medium',
      estimatedTime: 120,
    },
    {
      title: 'The Digital Labyrinth',
      category: 'ADHD Assessment',
      text: 'In the virtual simulation of the network grid, packet clusters travel along glowing fiber routes. A single routing error can redirect thousands of petabytes into the digital void. Engineers must monitor the console for continuous telemetry feedback, tracking visual signals across multiple blinking indicators. If focus drops for even a fraction of a second, the system flags a synchronization mismatch.',
      difficulty: 'Hard',
      estimatedTime: 150,
    },
    {
      title: 'The Ancient Scroll of Aegis',
      category: 'Dyslexia Screening',
      text: "The translation of archaic runic text requires careful visual processing. Scholars must distinguish between extremely similar letterforms, where tiny variations in stroke thickness alter the meaning from 'blessing' to 'calamity'. In the ruins of Aegis, the stone walls are carved with intricate spiral patterns that challenge the tracking eye. Read this text slowly, focusing on each symbol's exact curves.",
      difficulty: 'Hard',
      estimatedTime: 180,
    },
  ];

  for (const t of tests) {
    await prisma.readingTest.upsert({
      where: { id: t.title }, // Fallback to Title match as ID is UUID, let's query first or do custom upsert
      update: {},
      create: {
        title: t.title,
        category: t.category,
        text: t.text,
        difficulty: t.difficulty,
        estimatedTime: t.estimatedTime,
      },
    }).catch(async () => {
      // If we use Title matching or custom logic:
      const existing = await prisma.readingTest.findFirst({ where: { title: t.title } });
      if (!existing) {
        await prisma.readingTest.create({ data: t });
      }
    });
  }
  console.log('Seeded 5 diverse reading screening tests.');

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
