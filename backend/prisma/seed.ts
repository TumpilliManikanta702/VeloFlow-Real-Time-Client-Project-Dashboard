import { PrismaClient, UserRole, TaskStatus, TaskPriority, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting VeloFlow Database Seed...');

  // Reset existing data safely
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('Password123!', saltRounds);

  // 1. Create Users
  console.log('Creating users...');
  const admin = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins (Admin)',
      email: 'admin@velozity.dev',
      passwordHash,
      role: UserRole.ADMIN,
      isOnline: true,
      lastSeenAt: new Date(),
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      name: 'Marcus Vance (PM 1)',
      email: 'pm1@velozity.dev',
      passwordHash,
      role: UserRole.PROJECT_MANAGER,
      isOnline: true,
      lastSeenAt: new Date(),
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      name: 'Elena Rostova (PM 2)',
      email: 'pm2@velozity.dev',
      passwordHash,
      role: UserRole.PROJECT_MANAGER,
      isOnline: false,
      lastSeenAt: new Date(Date.now() - 3600000 * 2),
    },
  });

  const dev1 = await prisma.user.create({
    data: {
      name: 'Alex Chen (Dev 1)',
      email: 'dev1@velozity.dev',
      passwordHash,
      role: UserRole.DEVELOPER,
      isOnline: true,
      lastSeenAt: new Date(),
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      name: 'Priya Sharma (Dev 2)',
      email: 'dev2@velozity.dev',
      passwordHash,
      role: UserRole.DEVELOPER,
      isOnline: true,
      lastSeenAt: new Date(),
    },
  });

  const dev3 = await prisma.user.create({
    data: {
      name: 'David Kim (Dev 3)',
      email: 'dev3@velozity.dev',
      passwordHash,
      role: UserRole.DEVELOPER,
      isOnline: false,
      lastSeenAt: new Date(Date.now() - 3600000 * 5),
    },
  });

  const dev4 = await prisma.user.create({
    data: {
      name: 'Liam O’Connor (Dev 4)',
      email: 'dev4@velozity.dev',
      passwordHash,
      role: UserRole.DEVELOPER,
      isOnline: false,
      lastSeenAt: new Date(Date.now() - 86400000),
    },
  });

  // 2. Create Clients
  console.log('Creating clients...');
  const client1 = await prisma.client.create({
    data: {
      name: 'Arthur Sterling',
      email: 'arthur@nexusfintech.com',
      companyName: 'Nexus Global FinTech',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Rebecca Torres',
      email: 'rebecca@healthpulse.io',
      companyName: 'HealthPulse Diagnostics',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'Julian Hayes',
      email: 'julian@vortexlogistics.net',
      companyName: 'Vortex Cloud Logistics',
    },
  });

  // 3. Create Projects
  console.log('Creating projects...');
  const now = new Date();
  const oneWeekLater = new Date(now.getTime() + 7 * 86400000);
  const twoWeeksLater = new Date(now.getTime() + 14 * 86400000);
  const pastDue1 = new Date(now.getTime() - 2 * 86400000);
  const pastDue2 = new Date(now.getTime() - 4 * 86400000);

  // PM 1 Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Nexus High-Throughput Trading Engine',
      description: 'Ultra-low latency settlement pipeline with microsecond precision order matching.',
      clientId: client1.id,
      createdById: pm1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'HealthPulse Real-Time Telemetry Portal',
      description: 'HIPAA-compliant patient vitals streaming dashboard and alert notification cluster.',
      clientId: client2.id,
      createdById: pm1.id,
    },
  });

  // PM 2 Project
  const project3 = await prisma.project.create({
    data: {
      name: 'Vortex Global Fleet Routing AI',
      description: 'Dynamic container routing engine optimizing maritime fuel efficiency and ETA forecasts.',
      clientId: client3.id,
      createdById: pm2.id,
    },
  });

  // 4. Create Tasks for Project 1 (Nexus Trading - PM1)
  console.log('Creating tasks for Project 1...');
  const t1_1 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Architect Order Book Matching Kernel',
      description: 'Implement lock-free ring buffer for matching engine and FIX protocol serializer.',
      assignedDeveloperId: dev1.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      dueDate: oneWeekLater,
      isOverdue: false,
    },
  });

  const t1_2 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Design PostgreSQL Ledger Settlement Schema',
      description: 'Create partitioned double-entry accounting ledger tables with foreign key constraints.',
      assignedDeveloperId: dev2.id,
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      dueDate: oneWeekLater,
      isOverdue: false,
    },
  });

  const t1_3 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Fix Stale WebSocket Ticker Disconnects',
      description: 'Heartbeat ping/pong intervals drift under heavy burst loads.',
      assignedDeveloperId: dev1.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.CRITICAL,
      dueDate: pastDue1,
      isOverdue: true, // Overdue task 1
    },
  });

  const t1_4 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Integrate OAuth 2.0 Mutual TLS Handshake',
      description: 'Configure institutional API gateway client certificate validation.',
      assignedDeveloperId: dev3.id,
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      dueDate: pastDue2,
      isOverdue: false,
    },
  });

  const t1_5 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Benchmark Market Feed Ingestion Rate',
      description: 'Run k6 load tests targeting 50,000 orders/sec sustained throughput.',
      assignedDeveloperId: dev2.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: twoWeeksLater,
      isOverdue: false,
    },
  });

  // 5. Create Tasks for Project 2 (HealthPulse - PM1)
  console.log('Creating tasks for Project 2...');
  const t2_1 = await prisma.task.create({
    data: {
      projectId: project2.id,
      title: 'Implement ECG Waveform WebGL Visualizer',
      description: 'Render real-time 60fps telemetry graph using WebGL canvas and SSE/WebSocket stream.',
      assignedDeveloperId: dev3.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: oneWeekLater,
      isOverdue: false,
    },
  });

  const t2_2 = await prisma.task.create({
    data: {
      projectId: project2.id,
      title: 'Audit Patient Vitals Audit Trail Logs',
      description: 'Ensure immutable audit logs comply with ISO 27001 and HIPAA security standards.',
      assignedDeveloperId: dev4.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.CRITICAL,
      dueDate: pastDue2,
      isOverdue: true, // Overdue task 2
    },
  });

  const t2_3 = await prisma.task.create({
    data: {
      projectId: project2.id,
      title: 'Encrypt Vitals Database at Rest (AES-256-GCM)',
      description: 'Implement field-level encryption for sensitive medical telemetry records.',
      assignedDeveloperId: dev1.id,
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: pastDue1,
      isOverdue: false,
    },
  });

  const t2_4 = await prisma.task.create({
    data: {
      projectId: project2.id,
      title: 'SMS Alert Dispatcher Integration via Twilio',
      description: 'Send high-priority SMS notifications to on-call physicians when vitals breach threshold.',
      assignedDeveloperId: dev4.id,
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.MEDIUM,
      dueDate: oneWeekLater,
      isOverdue: false,
    },
  });

  const t2_5 = await prisma.task.create({
    data: {
      projectId: project2.id,
      title: 'Telemetry Ingestion API Gateway Throttling',
      description: 'Apply token bucket rate limiter to prevent sensor device denial-of-service.',
      assignedDeveloperId: dev3.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: twoWeeksLater,
      isOverdue: false,
    },
  });

  // 6. Create Tasks for Project 3 (Vortex Fleet - PM2)
  console.log('Creating tasks for Project 3...');
  const t3_1 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: 'Deploy Dijkstra Weather-Weighted Waypoint Solver',
      description: 'Calculate maritime route fuel efficiency taking real-time NOAA storm data into account.',
      assignedDeveloperId: dev2.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.CRITICAL,
      dueDate: oneWeekLater,
      isOverdue: false,
    },
  });

  const t3_2 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: 'AIS Transponder Ingestion Pipeline',
      description: 'Kafka consumer for parsing NMEA 0183 vessel position messages.',
      assignedDeveloperId: dev4.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: oneWeekLater,
      isOverdue: false,
    },
  });

  const t3_3 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: 'Port Authority Customs Clearing Webhook',
      description: 'Post automated manifest updates to Singapore & Rotterdam port customs endpoints.',
      assignedDeveloperId: dev1.id,
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.MEDIUM,
      dueDate: oneWeekLater,
      isOverdue: false,
    },
  });

  const t3_4 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: 'Port Berthing Conflict Resolution Algorithm',
      description: 'Prevent multi-vessel dock overlap by scheduling dynamic anchorage queues.',
      assignedDeveloperId: dev3.id,
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: pastDue1,
      isOverdue: false,
    },
  });

  const t3_5 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: 'Vessel Bunker Fuel Consumption Predictive Model',
      description: 'Train regression model forecasting consumption based on sea swell height and knot speed.',
      assignedDeveloperId: dev2.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: twoWeeksLater,
      isOverdue: false,
    },
  });

  // 7. Create Activity Logs
  console.log('Creating activity logs...');
  await prisma.activityLog.createMany({
    data: [
      {
        projectId: project1.id,
        taskId: t1_2.id,
        userId: dev2.id,
        action: 'STATUS_CHANGED',
        oldStatus: TaskStatus.IN_PROGRESS,
        newStatus: TaskStatus.IN_REVIEW,
        metadata: { taskTitle: t1_2.title, userName: dev2.name },
        createdAt: new Date(now.getTime() - 15 * 60000), // 15 mins ago
      },
      {
        projectId: project1.id,
        taskId: t1_1.id,
        userId: dev1.id,
        action: 'STATUS_CHANGED',
        oldStatus: TaskStatus.TODO,
        newStatus: TaskStatus.IN_PROGRESS,
        metadata: { taskTitle: t1_1.title, userName: dev1.name },
        createdAt: new Date(now.getTime() - 45 * 60000), // 45 mins ago
      },
      {
        projectId: project2.id,
        taskId: t2_4.id,
        userId: dev4.id,
        action: 'STATUS_CHANGED',
        oldStatus: TaskStatus.IN_PROGRESS,
        newStatus: TaskStatus.IN_REVIEW,
        metadata: { taskTitle: t2_4.title, userName: dev4.name },
        createdAt: new Date(now.getTime() - 120 * 60000), // 2 hours ago
      },
      {
        projectId: project3.id,
        taskId: t3_3.id,
        userId: dev1.id,
        action: 'STATUS_CHANGED',
        oldStatus: TaskStatus.IN_PROGRESS,
        newStatus: TaskStatus.IN_REVIEW,
        metadata: { taskTitle: t3_3.title, userName: dev1.name },
        createdAt: new Date(now.getTime() - 180 * 60000), // 3 hours ago
      },
      {
        projectId: project1.id,
        taskId: t1_4.id,
        userId: dev3.id,
        action: 'STATUS_CHANGED',
        oldStatus: TaskStatus.IN_REVIEW,
        newStatus: TaskStatus.DONE,
        metadata: { taskTitle: t1_4.title, userName: dev3.name },
        createdAt: new Date(now.getTime() - 360 * 60000), // 6 hours ago
      },
    ],
  });

  // 8. Create Notifications
  console.log('Creating notifications...');
  await prisma.notification.createMany({
    data: [
      {
        recipientId: dev1.id,
        taskId: t1_1.id,
        projectId: project1.id,
        type: NotificationType.TASK_ASSIGNED,
        title: 'New Task Assignment',
        message: `You were assigned Task: "${t1_1.title}" in ${project1.name}`,
        isRead: false,
        createdAt: new Date(now.getTime() - 50 * 60000),
      },
      {
        recipientId: pm1.id,
        taskId: t1_2.id,
        projectId: project1.id,
        type: NotificationType.TASK_IN_REVIEW,
        title: 'Task Submitted for Review',
        message: `${dev2.name} submitted "${t1_2.title}" for review in ${project1.name}`,
        isRead: false,
        createdAt: new Date(now.getTime() - 15 * 60000),
      },
      {
        recipientId: dev2.id,
        taskId: t3_1.id,
        projectId: project3.id,
        type: NotificationType.TASK_ASSIGNED,
        title: 'New Task Assignment',
        message: `You were assigned Task: "${t3_1.title}" in ${project3.name}`,
        isRead: true,
        readAt: new Date(now.getTime() - 100 * 60000),
        createdAt: new Date(now.getTime() - 200 * 60000),
      },
      {
        recipientId: pm2.id,
        taskId: t3_3.id,
        projectId: project3.id,
        type: NotificationType.TASK_IN_REVIEW,
        title: 'Task Submitted for Review',
        message: `${dev1.name} submitted "${t3_3.title}" for review in ${project3.name}`,
        isRead: false,
        createdAt: new Date(now.getTime() - 180 * 60000),
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log('----------------------------------------------------');
  console.log('Credentials Summary (All passwords: Password123!):');
  console.log('  Admin:       admin@velozity.dev');
  console.log('  PM 1:        pm1@velozity.dev');
  console.log('  PM 2:        pm2@velozity.dev');
  console.log('  Developer 1: dev1@velozity.dev');
  console.log('  Developer 2: dev2@velozity.dev');
  console.log('  Developer 3: dev3@velozity.dev');
  console.log('  Developer 4: dev4@velozity.dev');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
