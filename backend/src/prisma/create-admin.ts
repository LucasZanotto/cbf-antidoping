// prisma/create-admin.ts
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@cbf.local';
  const password = 'admin123';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: UserRole.ADMIN_CBF, isActive: true },
    create: {
      name: 'Admin CBF',
      email,
      passwordHash,
      role: UserRole.ADMIN_CBF,
      isActive: true,
    },
  });
  console.log('✅ Admin pronto:', { email, password });
}
main().finally(() => prisma.$disconnect());
