import {
  PrismaClient,
  UserRole,
  AthleteStatus,
  TestReason,
  TestPriority,
  TestOrderStatus,
  SampleType,
  SampleStatus,
  LabAssignmentStatus,
  TestOutcome,
  FinalResultStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // -------------------------
  // Federações
  // -------------------------
  const fedSP = await prisma.federation.upsert({
    where: { uf: 'SP' },
    update: {},
    create: {
      uf: 'SP',
      name: 'Federação Paulista de Futebol',
    },
  });

  const fedRJ = await prisma.federation.upsert({
    where: { uf: 'RJ' },
    update: {},
    create: {
      uf: 'RJ',
      name: 'Federação de Futebol do Estado do Rio de Janeiro',
    },
  });

  // -------------------------
  // Clubes
  // -------------------------
  const corinthians = await prisma.club.upsert({
    where: { id: 'seed-club-1' }, // mantém compatibilidade com o que você já usava
    update: {},
    create: {
      id: 'seed-club-1',
      name: 'SC Corinthians',
      federationId: fedSP.id,
    },
  });

  const flamengo = await prisma.club.upsert({
    where: { id: 'seed-club-2' },
    update: {},
    create: {
      id: 'seed-club-2',
      name: 'CR Flamengo',
      federationId: fedRJ.id,
    },
  });

  // -------------------------
  // Laboratórios
  // -------------------------
  const labLBCD = await prisma.lab.upsert({
    where: { code: 'WADA-DF-007' },
    update: {},
    create: {
      code: 'WADA-DF-007',
      name: 'LBCD - Brasília',
      country: 'BRA',
      isActive: true,
    },
  });

  const labLadetec = await prisma.lab.upsert({
    where: { code: 'WADA-RJ-001' },
    update: {},
    create: {
      code: 'WADA-RJ-001',
      name: 'Ladetec - Rio de Janeiro',
      country: 'BRA',
      isActive: true,
    },
  });

  // -------------------------
  // Atletas
  // -------------------------
  const athlete1 = await prisma.athlete.upsert({
    where: { cbfCode: '2025-000001' },
    update: {},
    create: {
      cbfCode: '2025-000001',
      fullName: 'Dornelas',
      birthDate: new Date('1995-06-15'),
      nationality: 'BRA',
      cpfHash: 'cpfhash-0001',
      sex: 'M',
      status: AthleteStatus.ELIGIBLE,
    },
  });

  const athlete2 = await prisma.athlete.upsert({
    where: { cbfCode: '2025-000002' },
    update: {},
    create: {
      cbfCode: '2025-000002',
      fullName: 'Jogador Exemplo 2',
      birthDate: new Date('1998-03-10'),
      nationality: 'BRA',
      cpfHash: 'cpfhash-0002',
      sex: 'M',
      status: AthleteStatus.ELIGIBLE,
    },
  });

  const athlete3 = await prisma.athlete.upsert({
    where: { cbfCode: '2025-000003' },
    update: {},
    create: {
      cbfCode: '2025-000003',
      fullName: 'Jogadora Exemplo',
      birthDate: new Date('2000-09-01'),
      nationality: 'BRA',
      cpfHash: 'cpfhash-0003',
      sex: 'F',
      status: AthleteStatus.ELIGIBLE,
    },
  });

  // -------------------------
  // Afiliações de atletas
  // -------------------------
  const aff1 = await prisma.athleteAffiliation.upsert({
    where: { id: 'aff-1' },
    update: {},
    create: {
      id: 'aff-1',
      athleteId: athlete1.id,
      federationId: fedSP.id,
      clubId: corinthians.id,
      startDate: new Date('2025-01-01'),
      status: 'active',
    },
  });

  const aff2 = await prisma.athleteAffiliation.upsert({
    where: { id: 'aff-2' },
    update: {},
    create: {
      id: 'aff-2',
      athleteId: athlete2.id,
      federationId: fedSP.id,
      clubId: corinthians.id,
      startDate: new Date('2025-01-01'),
      status: 'active',
    },
  });

  const aff3 = await prisma.athleteAffiliation.upsert({
    where: { id: 'aff-3' },
    update: {},
    create: {
      id: 'aff-3',
      athleteId: athlete3.id,
      federationId: fedRJ.id,
      clubId: flamengo.id,
      startDate: new Date('2025-01-01'),
      status: 'active',
    },
  });

  // -------------------------
  // Usuários (apenas pra referenciar nas ordens)
  // -------------------------
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cbf.local' },
    update: {},
    create: {
      name: 'Admin CBF',
      email: 'admin@cbf.local',
      passwordHash: 'hashed-admin', // placeholder, só pra preencher
      role: UserRole.ADMIN_CBF,
      isActive: true,
    },
  });

  const fedUserSP = await prisma.user.upsert({
    where: { email: 'fed-sp@cbf.local' },
    update: {},
    create: {
      name: 'Usuário Federação SP',
      email: 'fed-sp@cbf.local',
      passwordHash: 'hashed-fed-sp',
      role: UserRole.FED_USER,
      federationId: fedSP.id,
      isActive: true,
    },
  });

  const clubUserCor = await prisma.user.upsert({
    where: { email: 'club-cor@cbf.local' },
    update: {},
    create: {
      name: 'Usuário SC Corinthians',
      email: 'club-cor@cbf.local',
      passwordHash: 'hashed-club-cor',
      role: UserRole.CLUB_USER,
      clubId: corinthians.id,
      isActive: true,
    },
  });

  const labUser = await prisma.user.upsert({
    where: { email: 'lab-lbcd@cbf.local' },
    update: {},
    create: {
      name: 'Usuário LBCD',
      email: 'lab-lbcd@cbf.local',
      passwordHash: 'hashed-lab-lbcd',
      role: UserRole.LAB_USER,
      labId: labLBCD.id,
      isActive: true,
    },
  });

  const regulator = await prisma.user.upsert({
    where: { email: 'regulator@cbf.local' },
    update: {},
    create: {
      name: 'Regulador CBF',
      email: 'regulator@cbf.local',
      passwordHash: 'hashed-regulator',
      role: UserRole.REGULATOR,
      isActive: true,
    },
  });

  const auditor = await prisma.user.upsert({
    where: { email: 'auditor@cbf.local' },
    update: {},
    create: {
      name: 'Auditor CBF',
      email: 'auditor@cbf.local',
      passwordHash: 'hashed-auditor',
      role: UserRole.AUDITOR,
      isActive: true,
    },
  });

  // -------------------------
  // Ordem de Teste (completa)
  // -------------------------
  const order1 = await prisma.testOrder.upsert({
    where: { id: 'seed-order-1' },
    update: {},
    create: {
      id: 'seed-order-1',
      createdByUserId: admin.id,
      federationId: fedSP.id,
      clubId: corinthians.id,
      athleteId: athlete1.id,
      matchId: 'MATCH-2025-SP-001',
      reason: TestReason.IN_COMPETITION,
      priority: TestPriority.NORMAL,
      status: TestOrderStatus.COMPLETED,
    },
  });

  // -------------------------
  // Amostra
  // -------------------------
  const sample1 = await prisma.sample.upsert({
    where: { code: 'CBF-BL-2025-11-21-9UDH' },
    update: {},
    create: {
      id: 'seed-sample-1',
      testOrderId: order1.id,
      code: 'CBF-BL-2025-11-21-9UDH',
      type: SampleType.URINE,
      collectedAt: new Date('2025-11-21T13:00:00Z'),
      status: SampleStatus.RECEIVED,
    },
  });

  // -------------------------
  // Assignment de laboratório
  // -------------------------
  const assign1 = await prisma.labAssignment.upsert({
    where: { id: 'seed-assign-1' },
    update: {},
    create: {
      id: 'seed-assign-1',
      testOrderId: order1.id,
      labId: labLBCD.id,
      assignedAt: new Date('2025-11-21T13:30:00Z'),
      status: LabAssignmentStatus.DONE,
    },
  });

  // -------------------------
  // Resultado de Teste (como o PDF que você mostrou)
  // -------------------------
  const result1 = await prisma.testResult.upsert({
    where: { sampleId: sample1.id }, // unique
    update: {},
    create: {
      sampleId: sample1.id,
      labId: labLBCD.id,
      reportedAt: new Date('2025-11-21T13:56:00Z'),
      outcome: TestOutcome.INCONCLUSIVE,
      finalStatus: FinalResultStatus.CONFIRMED,
      detailsJson: {
        notes: 'Sem indícios de adulteração.',
        panel: ['EPO', 'Anabolic agents'],
        matrix: 'Urine',
        method: 'GC/MS',
      },
      pdfReportUrl: null,
    },
  });

  console.log({
    fedSP,
    fedRJ,
    corinthians,
    flamengo,
    labLBCD,
    labLadetec,
    athlete1,
    athlete2,
    athlete3,
    aff1,
    aff2,
    aff3,
    admin,
    fedUserSP,
    clubUserCor,
    labUser,
    regulator,
    auditor,
    order1,
    sample1,
    assign1,
    result1,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
