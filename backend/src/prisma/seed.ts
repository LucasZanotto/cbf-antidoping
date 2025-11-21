import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const fed = await prisma.federation.upsert({
    where: { uf: 'SP' },
    update: {},
    create: { uf: 'SP', name: 'Federação Paulista de Futebol' },
  });

  const club = await prisma.club.upsert({
    where: { id: 'seed-club-1' },
    update: {},
    create: { id: 'seed-club-1', name: 'SC Corinthians', federationId: fed.id },
  });

  await prisma.athlete.upsert({
    where: { cbfCode: '2025-000001' },
    update: {},
    create: {
      cbfCode: '2025-000001',
      fullName: 'Jogador Exemplo',
      birthDate: new Date('1998-03-10'),
      nationality: 'BRA',
      cpfHash: 'cpfhash-0001',
      sex: 'M',
    },
  });

  console.log({ fed, club });
}

main().finally(() => prisma.$disconnect());
