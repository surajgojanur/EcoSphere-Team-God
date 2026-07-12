import bcrypt from "bcryptjs";
import {
  ActivityStatus,
  ApprovalStatus,
  AuditStatus,
  BadgeStatus,
  CategoryType,
  ChallengeStatus,
  ComplianceIssueStatus,
  DepartmentStatus,
  Difficulty,
  NotificationType,
  OperationalSourceType,
  PolicyStatus,
  PrismaClient,
  RecordStatus,
  RewardCurrency,
  RewardStatus,
  Role,
  Severity,
  TrainingStatus
} from "@prisma/client";

const prisma = new PrismaClient();
const demoPassword = "Demo@12345";

async function main() {
  const passwordHash = await bcrypt.hash(demoPassword, 12);

  const corporate = await prisma.department.upsert({
    where: { code: "CORP" },
    update: { name: "Corporate", status: DepartmentStatus.ACTIVE },
    create: { id: "00000000-0000-4000-8000-000000000101", name: "Corporate", code: "CORP" }
  });
  const manufacturing = await prisma.department.upsert({
    where: { code: "MFG" },
    update: { name: "Manufacturing", parentId: corporate.id, status: DepartmentStatus.ACTIVE },
    create: { id: "00000000-0000-4000-8000-000000000102", name: "Manufacturing", code: "MFG", parentId: corporate.id }
  });
  const logistics = await prisma.department.upsert({
    where: { code: "LOG" },
    update: { name: "Logistics", parentId: corporate.id, status: DepartmentStatus.ACTIVE },
    create: { id: "00000000-0000-4000-8000-000000000103", name: "Logistics", code: "LOG", parentId: corporate.id }
  });
  await prisma.department.upsert({
    where: { code: "HR" },
    update: { name: "Human Resources", parentId: corporate.id, status: DepartmentStatus.ACTIVE },
    create: { id: "00000000-0000-4000-8000-000000000104", name: "Human Resources", code: "HR", parentId: corporate.id }
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@ecosphere.demo" },
    update: { passwordHash, name: "Admin User", role: Role.ADMIN, departmentId: corporate.id, isActive: true },
    create: { id: "00000000-0000-4000-8000-000000000201", email: "admin@ecosphere.demo", passwordHash, name: "Admin User", role: Role.ADMIN, departmentId: corporate.id }
  });
  const manager = await prisma.user.upsert({
    where: { email: "manager@ecosphere.demo" },
    update: { passwordHash, name: "ESG Manager", role: Role.ESG_MANAGER, departmentId: corporate.id, isActive: true },
    create: { id: "00000000-0000-4000-8000-000000000202", email: "manager@ecosphere.demo", passwordHash, name: "ESG Manager", role: Role.ESG_MANAGER, departmentId: corporate.id }
  });
  const employee = await prisma.user.upsert({
    where: { email: "employee@ecosphere.demo" },
    update: { passwordHash, name: "Employee User", role: Role.EMPLOYEE, departmentId: manufacturing.id, isActive: true },
    create: { id: "00000000-0000-4000-8000-000000000203", email: "employee@ecosphere.demo", passwordHash, name: "Employee User", role: Role.EMPLOYEE, departmentId: manufacturing.id }
  });
  const auditor = await prisma.user.upsert({
    where: { email: "auditor@ecosphere.demo" },
    update: { passwordHash, name: "Audit User", role: Role.AUDITOR, departmentId: corporate.id, isActive: true },
    create: { id: "00000000-0000-4000-8000-000000000204", email: "auditor@ecosphere.demo", passwordHash, name: "Audit User", role: Role.AUDITOR, departmentId: corporate.id }
  });

  await prisma.eSGConfiguration.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } });
  await prisma.notificationSetting.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } });

  const csrCategory = await prisma.category.upsert({
    where: { name_type: { name: "Community Service", type: CategoryType.CSR_ACTIVITY } },
    update: { status: RecordStatus.ACTIVE },
    create: { id: "00000000-0000-4000-8000-000000000301", name: "Community Service", type: CategoryType.CSR_ACTIVITY }
  });
  const challengeCategory = await prisma.category.upsert({
    where: { name_type: { name: "Carbon Saver", type: CategoryType.CHALLENGE } },
    update: { status: RecordStatus.ACTIVE },
    create: { id: "00000000-0000-4000-8000-000000000302", name: "Carbon Saver", type: CategoryType.CHALLENGE }
  });

  const factor = await prisma.emissionFactor.upsert({
    where: { code: "DIESEL-L" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000401",
      code: "DIESEL-L",
      activityName: "Diesel fuel",
      factorValue: "2.680000",
      inputUnit: "L",
      outputUnit: "kgCO2e",
      applicableSourceType: OperationalSourceType.FLEET,
      validFrom: new Date("2026-01-01T00:00:00Z")
    }
  });

  await prisma.productESGProfile.upsert({
    where: { productCode: "ECO-PANEL-01" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000501",
      productCode: "ECO-PANEL-01",
      productName: "Eco Panel",
      carbonFootprint: "12.500000",
      recycledContentPercentage: "35.00",
      recyclablePercentage: "80.00",
      certifications: ["ISO14001"],
      validFrom: new Date("2026-01-01T00:00:00Z"),
      status: RecordStatus.ACTIVE
    }
  });

  await prisma.environmentalGoal.upsert({
    where: { id: "00000000-0000-4000-8000-000000000601" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000601",
      name: "Reduce manufacturing CO2",
      departmentId: manufacturing.id,
      targetCo2: "1000.000000",
      currentCo2: "450.000000",
      startDate: new Date("2026-01-01T00:00:00Z"),
      deadline: new Date("2026-12-31T00:00:00Z")
    }
  });

  const event = await prisma.operationalEmissionEvent.upsert({
    where: { sourceSystem_externalReference: { sourceSystem: "ODOO", externalReference: "fleet-trip-seed" } },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000701",
      sourceType: OperationalSourceType.FLEET,
      sourceSystem: "ODOO",
      externalReference: "fleet-trip-seed",
      departmentId: logistics.id,
      emissionFactorId: factor.id,
      quantity: "100.000000",
      occurredOn: new Date("2026-07-01T00:00:00Z"),
      metadata: { seed: true },
      factorValueSnapshot: factor.factorValue,
      inputUnitSnapshot: factor.inputUnit,
      calculatedEmission: "268.000000",
      createdById: manager.id
    }
  });
  await prisma.carbonTransaction.upsert({
    where: { operationalEventId: event.id },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000702",
      departmentId: logistics.id,
      emissionFactorId: factor.id,
      operationalEventId: event.id,
      loggedById: manager.id,
      quantity: event.quantity,
      factorValueSnapshot: factor.factorValue,
      inputUnitSnapshot: factor.inputUnit,
      calculatedEmission: event.calculatedEmission,
      transactionDate: event.occurredOn,
      sourceType: event.sourceType,
      sourceSystem: event.sourceSystem,
      externalReference: event.externalReference,
      sourceMetadata: event.metadata ?? undefined
    }
  });

  const csr = await prisma.cSRActivity.upsert({
    where: { id: "00000000-0000-4000-8000-000000000801" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000801",
      title: "Tree planting drive",
      categoryId: csrCategory.id,
      evidenceRequired: true,
      pointsAwarded: 150,
      eventDate: new Date("2026-07-15T00:00:00Z"),
      status: ActivityStatus.ACTIVE,
      createdById: manager.id
    }
  });
  await prisma.employeeParticipation.upsert({
    where: { employeeId_activityId: { employeeId: employee.id, activityId: csr.id } },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000802",
      employeeId: employee.id,
      activityId: csr.id,
      proofUrl: "https://example.com/proofs/tree-planting",
      approvalStatus: ApprovalStatus.APPROVED,
      pointsEarned: csr.pointsAwarded,
      completionDate: new Date("2026-07-15T00:00:00Z"),
      reviewedById: manager.id,
      reviewedAt: new Date()
    }
  });

  await prisma.diversitySnapshot.upsert({
    where: { departmentId_snapshotDate: { departmentId: manufacturing.id, snapshotDate: new Date("2026-07-01T00:00:00Z") } },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000901",
      departmentId: manufacturing.id,
      snapshotDate: new Date("2026-07-01T00:00:00Z"),
      totalEmployees: 25,
      femaleEmployees: 10,
      maleEmployees: 13,
      nonBinaryEmployees: 1,
      undisclosedEmployees: 1,
      underrepresentedEmployees: 7
    }
  });
  await prisma.trainingRecord.upsert({
    where: { id: "00000000-0000-4000-8000-000000000902" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000902",
      employeeId: employee.id,
      title: "Sustainability Basics",
      provider: "EcoSphere Academy",
      hours: "2.50",
      status: TrainingStatus.COMPLETED,
      startedOn: new Date("2026-07-01T00:00:00Z"),
      completedOn: new Date("2026-07-02T00:00:00Z"),
      certificateUrl: "https://example.com/certificates/sustainability-basics"
    }
  });

  const challenge = await prisma.challenge.upsert({
    where: { id: "00000000-0000-4000-8000-000000001001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000001001",
      title: "Low commute week",
      categoryId: challengeCategory.id,
      xp: 250,
      difficulty: Difficulty.EASY,
      evidenceRequired: true,
      startDate: new Date("2026-07-01T00:00:00Z"),
      deadline: new Date("2026-07-31T00:00:00Z"),
      status: ChallengeStatus.ACTIVE,
      createdById: manager.id
    }
  });
  await prisma.challengeParticipation.upsert({
    where: { challengeId_employeeId: { challengeId: challenge.id, employeeId: employee.id } },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000001002",
      challengeId: challenge.id,
      employeeId: employee.id,
      progress: 100,
      proofUrl: "https://example.com/proofs/low-commute",
      approvalStatus: ApprovalStatus.APPROVED,
      xpAwarded: challenge.xp,
      submittedAt: new Date(),
      reviewedById: manager.id,
      reviewedAt: new Date()
    }
  });
  const badge = await prisma.badge.upsert({
    where: { name: "CSR Starter" },
    update: {},
    create: { id: "00000000-0000-4000-8000-000000001101", name: "CSR Starter", unlockRule: "CSR_POINTS>=100", status: BadgeStatus.ACTIVE }
  });
  await prisma.employeeBadge.upsert({
    where: { employeeId_badgeId: { employeeId: employee.id, badgeId: badge.id } },
    update: {},
    create: { id: "00000000-0000-4000-8000-000000001102", employeeId: employee.id, badgeId: badge.id, source: "SEED" }
  });
  await prisma.reward.upsert({
    where: { id: "00000000-0000-4000-8000-000000001201" },
    update: {},
    create: { id: "00000000-0000-4000-8000-000000001201", name: "Reusable bottle", cost: 100, currency: RewardCurrency.POINTS, stock: 10, status: RewardStatus.ACTIVE }
  });
  await prisma.reward.upsert({
    where: { id: "00000000-0000-4000-8000-000000001202" },
    update: {},
    create: { id: "00000000-0000-4000-8000-000000001202", name: "Learning credit", cost: 200, currency: RewardCurrency.XP, stock: 5, status: RewardStatus.ACTIVE }
  });

  const policy = await prisma.eSGPolicy.upsert({
    where: { id: "00000000-0000-4000-8000-000000001301" },
    update: {},
    create: { id: "00000000-0000-4000-8000-000000001301", title: "ESG Code of Conduct", documentUrl: "https://example.com/policies/esg-code", status: PolicyStatus.PUBLISHED, publishedAt: new Date(), createdById: manager.id }
  });
  await prisma.policyAcknowledgement.upsert({
    where: { policyId_employeeId: { policyId: policy.id, employeeId: employee.id } },
    update: {},
    create: { id: "00000000-0000-4000-8000-000000001302", policyId: policy.id, employeeId: employee.id }
  });
  const audit = await prisma.audit.upsert({
    where: { id: "00000000-0000-4000-8000-000000001401" },
    update: {},
    create: { id: "00000000-0000-4000-8000-000000001401", title: "Manufacturing compliance review", departmentId: manufacturing.id, auditorId: auditor.id, scopeStart: new Date("2026-07-01T00:00:00Z"), scopeEnd: new Date("2026-07-31T00:00:00Z"), status: AuditStatus.UNDER_REVIEW }
  });
  await prisma.complianceIssue.upsert({
    where: { id: "00000000-0000-4000-8000-000000001402" },
    update: {},
    create: { id: "00000000-0000-4000-8000-000000001402", auditId: audit.id, departmentId: manufacturing.id, description: "Safety checklist missing evidence", severity: Severity.MEDIUM, ownerId: manager.id, dueDate: new Date("2026-07-20T00:00:00Z"), status: ComplianceIssueStatus.OPEN, createdById: auditor.id }
  });
  await prisma.notification.upsert({
    where: { id: "00000000-0000-4000-8000-000000001501" },
    update: {},
    create: { id: "00000000-0000-4000-8000-000000001501", userId: employee.id, type: NotificationType.BADGE_UNLOCKED, title: "Badge unlocked", message: "You unlocked CSR Starter.", entityType: "Badge", entityId: badge.id }
  });
  await prisma.departmentScore.upsert({
    where: { departmentId_computedFor: { departmentId: manufacturing.id, computedFor: new Date("2026-07-12T00:00:00Z") } },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000001601",
      departmentId: manufacturing.id,
      environmentalScore: "45.00",
      socialScore: "100.00",
      governanceScore: "0.00",
      totalScore: "48.00",
      hasEnvironmentalData: true,
      hasSocialData: true,
      hasGovernanceData: true,
      computedFor: new Date("2026-07-12T00:00:00Z"),
      metadata: { seed: true }
    }
  });
  await prisma.activityLog.create({
    data: { actorUserId: admin.id, action: "SEED_COMPLETED", entityType: "System", metadata: { demo: true } }
  });

  console.log("Seeded EcoSphere MVP demo data.");
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

