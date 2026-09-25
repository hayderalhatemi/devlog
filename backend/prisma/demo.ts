import bcrypt from 'bcrypt';
import { prisma } from '../src/config/prisma.js';

async function main() {
  const password = await bcrypt.hash('demo1234', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@devlog.app' },
    update: { password },
    create: {
      name: 'Demo User',
      email: 'demo@devlog.app',
      password,
    },
  });

  const existingMembership = await prisma.teamMember.findFirst({
    where: { userId: user.id },
  });

  if (existingMembership) {
    console.log('Demo account already has data.');
    return;
  }

  await prisma.team.create({
    data: {
      name: 'Demo Team',
      members: {
        create: {
          userId: user.id,
          role: 'OWNER',
        },
      },
      projects: {
        create: {
          name: 'Website Redesign',
          description: 'Demo project for exploring DevLog features',
          tasks: {
            create: [
              {
                title: 'Design dashboard',
                description: 'Create the new dashboard layout',
                status: 'IN_PROGRESS',
                priority: 'HIGH',
                assigneeId: user.id,
              },
              {
                title: 'Improve mobile navigation',
                description: 'Improve navigation on smaller screens',
                status: 'TODO',
                priority: 'MEDIUM',
                assigneeId: user.id,
              },
              {
                title: 'Set up authentication',
                description: 'Implement JWT authentication',
                status: 'DONE',
                priority: 'HIGH',
                assigneeId: user.id,
              },
            ],
          },
        },
      },
    },
  });

  console.log('Demo account created successfully.');
}

main().catch(console.error);
