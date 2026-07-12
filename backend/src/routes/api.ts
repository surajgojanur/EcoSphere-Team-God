import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { SignJWT } from "jose";
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
  GoalStatus,
  NotificationType,
  OperationalSourceType,
  PolicyStatus,
  Prisma,
  RecordStatus,
  RedemptionStatus,
  RewardCurrency,
  RewardStatus,
  Role,
  Severity,
  TrainingStatus
} from "@prisma/client";
import { stringify } from "csv-stringify/sync";
import { z } from "zod";
import { env } from "../config/env.js";
import { prisma } from "../db/prisma.js";
import { AppError } from "../common/errors.js";
import { asyncRoute, requireAuth, requireRoles, validate } from "../common/middleware.js";
import { parsePagination, sendPage, sendSuccess } from "../common/http.js";
import type { AppRequest } from "../common/types.js";
import { businessDate, decimalString, departmentIdParam, idParam, isoDate, pageQuery, safeUrl } from "../common/validators.js";

const router = Router();
const db = prisma as any;
const adminOrManager = [Role.ADMIN, Role.ESG_MANAGER] as const;
const allRoles = [Role.ADMIN, Role.ESG_MANAGER, Role.EMPLOYEE, Role.AUDITOR] as const;

const authLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false
});

function decimal(value: string | number | Prisma.Decimal) {
  return new Prisma.Decimal(value);
}

function sanitizeUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId ?? null,
    departmentName: user.department?.name ?? null,
    isActive: user.isActive
  };
}

async function signToken(user: { id: string; role: Role; departmentId: string | null }) {
  return new SignJWT({ role: user.role, departmentId: user.departmentId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(new TextEncoder().encode(env.JWT_SECRET));
}

function ownOrPrivileged(req: AppRequest, ownerId: string) {
  if (!req.auth) throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
  if (req.auth.id === ownerId || req.auth.role === Role.ADMIN || req.auth.role === Role.ESG_MANAGER) return;
  throw new AppError(403, "FORBIDDEN", "You do not have permission to access this record.");
}

async function getSettings(tx = db) {
  const [esg, notification] = await Promise.all([
    tx.eSGConfiguration.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } }),
    tx.notificationSetting.upsert({ where: { id: "default" }, update: {}, create: { id: "default" } })
  ]);
  return { esg, notification };
}

async function logActivity(req: AppRequest, action: string, entityType: string, entityId?: string | null, metadata?: unknown, tx = db) {
  await tx.activityLog.create({
    data: {
      actorUserId: req.auth?.id ?? null,
      action,
      entityType,
      entityId: entityId ?? null,
      metadata: metadata === undefined ? undefined : (metadata as Prisma.InputJsonValue),
      requestId: req.requestId
    }
  });
}

async function notify(userId: string, type: NotificationType, title: string, message: string, entityType?: string, entityId?: string, tx = db) {
  const { notification } = await getSettings(tx);
  if (!notification.inAppEnabled) return null;
  return tx.notification.create({
    data: { userId, type, title, message, entityType, entityId }
  });
}

function ensureValidUrl(url: string | null | undefined, field = "url") {
  if (!url) return;
  const parsed = safeUrl().safeParse(url);
  if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "The submitted data is invalid.", { [field]: ["Enter a valid http or https URL."] });
}

function parseBadgeRule(rule: string) {
  const match = /^(XP|CHALLENGES_COMPLETED|CSR_PARTICIPATIONS|CSR_POINTS)>=(\d+)$/.exec(rule.trim());
  if (!match) throw new AppError(400, "INVALID_BADGE_RULE", "Badge rule must use a supported rule such as XP>=500.");
  return { metric: match[1], threshold: Number(match[2]) };
}

async function employeeBalances(employeeId: string, tx = db) {
  const [csr, challenges, spent] = await Promise.all([
    tx.employeeParticipation.aggregate({ where: { employeeId, approvalStatus: ApprovalStatus.APPROVED }, _sum: { pointsEarned: true } }),
    tx.challengeParticipation.aggregate({ where: { employeeId, approvalStatus: ApprovalStatus.APPROVED }, _sum: { xpAwarded: true } }),
    tx.rewardRedemption.groupBy({
      by: ["currencySnapshot"],
      where: { employeeId, status: { not: RedemptionStatus.CANCELLED } },
      _sum: { amountSpent: true }
    })
  ]);
  const pointsSpent = spent.find((row: any) => row.currencySnapshot === RewardCurrency.POINTS)?._sum.amountSpent ?? 0;
  const xpSpent = spent.find((row: any) => row.currencySnapshot === RewardCurrency.XP)?._sum.amountSpent ?? 0;
  const pointsEarned = csr._sum.pointsEarned ?? 0;
  const xpEarned = challenges._sum.xpAwarded ?? 0;
  return {
    pointsEarned,
    xpEarned,
    pointsSpent,
    xpSpent,
    pointsAvailable: pointsEarned - pointsSpent,
    xpAvailable: xpEarned - xpSpent
  };
}

async function evaluateBadges(employeeId: string, req: AppRequest, tx = db) {
  const { esg } = await getSettings(tx);
  if (!esg.autoBadgeAward) return [];
  const badges = await tx.badge.findMany({ where: { status: BadgeStatus.ACTIVE } });
  const balances = await employeeBalances(employeeId, tx);
  const [csrCount, challengeCount] = await Promise.all([
    tx.employeeParticipation.count({ where: { employeeId, approvalStatus: ApprovalStatus.APPROVED } }),
    tx.challengeParticipation.count({ where: { employeeId, approvalStatus: ApprovalStatus.APPROVED } })
  ]);
  const awarded = [];
  for (const badge of badges) {
    const rule = parseBadgeRule(badge.unlockRule);
    const current =
      rule.metric === "XP" ? balances.xpEarned :
      rule.metric === "CSR_POINTS" ? balances.pointsEarned :
      rule.metric === "CSR_PARTICIPATIONS" ? csrCount :
      challengeCount;
    if (current < rule.threshold) continue;
    const result = await tx.employeeBadge.upsert({
      where: { employeeId_badgeId: { employeeId, badgeId: badge.id } },
      update: {},
      create: { employeeId, badgeId: badge.id, source: "AUTO_AWARD" }
    });
    await notify(employeeId, NotificationType.BADGE_UNLOCKED, "Badge unlocked", `You unlocked ${badge.name}.`, "Badge", badge.id, tx);
    await logActivity(req, "BADGE_AWARDED", "Badge", badge.id, { employeeId }, tx);
    awarded.push(result);
  }
  return awarded;
}

async function activeFactor(emissionFactorId: string, occurredOn: Date, tx = db) {
  const factor = await tx.emissionFactor.findUnique({ where: { id: emissionFactorId } });
  if (!factor || factor.status !== RecordStatus.ACTIVE) throw new AppError(400, "VALIDATION_ERROR", "An active emission factor is required.");
  if (factor.validFrom > occurredOn || (factor.validTo && factor.validTo < occurredOn)) {
    throw new AppError(400, "VALIDATION_ERROR", "Emission factor is not valid for the selected date.");
  }
  return factor;
}

function calculatedEmission(quantity: string | number | Prisma.Decimal, factorValue: Prisma.Decimal) {
  return decimal(quantity).mul(factorValue);
}

const signupSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128)
}).strict();

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(128)
}).strict();

router.post("/auth/signup", authLimiter, validate({ body: signupSchema }), asyncRoute(async (req, res) => {
  const input = req.validated!.body as z.infer<typeof signupSchema>;
  const email = input.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) throw new AppError(409, "EMAIL_ALREADY_EXISTS", "An account already exists for this email.");
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await db.user.create({ data: { name: input.name, email, passwordHash, role: Role.EMPLOYEE }, include: { department: true } });
  await logActivity(req, "USER_SIGNED_UP", "User", user.id);
  sendSuccess(req, res, { user: sanitizeUser(user) }, 201);
}));

router.post("/auth/login", authLimiter, validate({ body: loginSchema }), asyncRoute(async (req, res) => {
  const input = req.validated!.body as z.infer<typeof loginSchema>;
  const user = await db.user.findUnique({ where: { email: input.email.toLowerCase() }, include: { department: true } });
  const ok = user ? await bcrypt.compare(input.password, user.passwordHash) : false;
  if (!user || !ok) throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  if (!user.isActive) throw new AppError(401, "INACTIVE_USER", "This account is inactive.");
  const token = await signToken(user);
  sendSuccess(req, res, { token, user: sanitizeUser(user) });
}));

router.get("/auth/me", requireAuth, asyncRoute(async (req, res) => {
  const user = await db.user.findUnique({ where: { id: req.auth!.id }, include: { department: true } });
  sendSuccess(req, res, { user: sanitizeUser(user) });
}));

router.use(requireAuth);

router.get("/users", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR), validate({ query: pageQuery }), asyncRoute(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const where: any = {};
  if (req.query.role) where.role = req.query.role;
  if (req.query.departmentId) where.departmentId = req.query.departmentId;
  if (req.query.search) where.OR = [{ name: { contains: String(req.query.search), mode: "insensitive" } }, { email: { contains: String(req.query.search), mode: "insensitive" } }];
  const [items, total] = await Promise.all([
    db.user.findMany({ where, include: { department: true }, skip, take: limit, orderBy: { createdAt: "desc" } }),
    db.user.count({ where })
  ]);
  sendPage(req, res, items.map(sanitizeUser), page, limit, total);
}));

router.get("/users/:id", validate({ params: idParam }), asyncRoute(async (req, res) => {
  const { id } = req.params;
  if (req.auth!.role === Role.EMPLOYEE && req.auth!.id !== id) throw new AppError(403, "FORBIDDEN", "Employees can only access their own profile.");
  const user = await db.user.findUniqueOrThrow({ where: { id }, include: { department: true } });
  sendSuccess(req, res, sanitizeUser(user));
}));

router.patch("/users/:id", requireRoles(Role.ADMIN), validate({ params: idParam, body: z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
  departmentId: z.string().uuid().nullable().optional(),
  role: z.nativeEnum(Role).optional()
}).strict() }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  const user = await db.user.update({ where: { id: req.params.id }, data: { ...body, email: body.email?.toLowerCase() }, include: { department: true } });
  await logActivity(req, "USER_UPDATED", "User", user.id);
  sendSuccess(req, res, sanitizeUser(user));
}));

router.patch("/users/:id/status", requireRoles(Role.ADMIN), validate({ params: idParam, body: z.object({ isActive: z.boolean() }).strict() }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  const user = await db.user.update({ where: { id: req.params.id }, data: { isActive: body.isActive }, include: { department: true } });
  await logActivity(req, "USER_STATUS_UPDATED", "User", user.id, { isActive: body.isActive });
  sendSuccess(req, res, sanitizeUser(user));
}));

async function hasDepartmentCycle(id: string, parentId: string | null) {
  let current = parentId;
  const seen = new Set<string>();
  while (current) {
    if (current === id || seen.has(current)) return true;
    seen.add(current);
    const parent = await db.department.findUnique({ where: { id: current }, select: { parentId: true } });
    current = parent?.parentId ?? null;
  }
  return false;
}

const departmentSchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
  parentId: z.string().uuid().nullable().optional(),
  headUserId: z.string().uuid().nullable().optional()
}).strict();

router.get("/departments", validate({ query: pageQuery }), asyncRoute(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const where: any = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.search) where.OR = [{ name: { contains: String(req.query.search), mode: "insensitive" } }, { code: { contains: String(req.query.search), mode: "insensitive" } }];
  const [items, total] = await Promise.all([db.department.findMany({ where, skip, take: limit, orderBy: { name: "asc" } }), db.department.count({ where })]);
  sendPage(req, res, items, page, limit, total);
}));

router.post("/departments", requireRoles(Role.ADMIN), validate({ body: departmentSchema }), asyncRoute(async (req, res) => {
  const item = await db.department.create({ data: req.validated!.body as any });
  await logActivity(req, "DEPARTMENT_CREATED", "Department", item.id);
  sendSuccess(req, res, item, 201);
}));

router.get("/departments/:id", validate({ params: idParam }), asyncRoute(async (req, res) => {
  sendSuccess(req, res, await db.department.findUniqueOrThrow({ where: { id: req.params.id } }));
}));

router.patch("/departments/:id", requireRoles(Role.ADMIN), validate({ params: idParam, body: departmentSchema.partial().strict() }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  if (body.parentId && await hasDepartmentCycle(String(req.params.id), body.parentId)) throw new AppError(400, "INVALID_PARENT_DEPARTMENT", "Department parent would create a hierarchy cycle.");
  const item = await db.department.update({ where: { id: req.params.id }, data: body });
  await logActivity(req, "DEPARTMENT_UPDATED", "Department", item.id);
  sendSuccess(req, res, item);
}));

router.delete("/departments/:id", requireRoles(Role.ADMIN), validate({ params: idParam }), asyncRoute(async (req, res) => {
  const item = await db.department.update({ where: { id: req.params.id }, data: { status: DepartmentStatus.INACTIVE } });
  await logActivity(req, "DEPARTMENT_DEACTIVATED", "Department", item.id);
  sendSuccess(req, res, item);
}));

const categorySchema = z.object({
  name: z.string().trim().min(1),
  type: z.nativeEnum(CategoryType),
  status: z.nativeEnum(RecordStatus).optional()
}).strict();

router.get("/categories", validate({ query: pageQuery }), asyncRoute(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const where: any = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.type) where.type = req.query.type;
  const [items, total] = await Promise.all([db.category.findMany({ where, skip, take: limit, orderBy: { name: "asc" } }), db.category.count({ where })]);
  sendPage(req, res, items, page, limit, total);
}));

router.post("/categories", requireRoles(...adminOrManager), validate({ body: categorySchema }), asyncRoute(async (req, res) => {
  const item = await db.category.create({ data: req.validated!.body as any });
  await logActivity(req, "CATEGORY_CREATED", "Category", item.id);
  sendSuccess(req, res, item, 201);
}));

router.get("/categories/:id", validate({ params: idParam }), asyncRoute(async (req, res) => sendSuccess(req, res, await db.category.findUniqueOrThrow({ where: { id: req.params.id } }))));
router.patch("/categories/:id", requireRoles(...adminOrManager), validate({ params: idParam, body: categorySchema.partial().strict() }), asyncRoute(async (req, res) => {
  const item = await db.category.update({ where: { id: req.params.id }, data: req.validated!.body as any });
  await logActivity(req, "CATEGORY_UPDATED", "Category", item.id);
  sendSuccess(req, res, item);
}));
router.delete("/categories/:id", requireRoles(...adminOrManager), validate({ params: idParam }), asyncRoute(async (req, res) => {
  const item = await db.category.update({ where: { id: req.params.id }, data: { status: RecordStatus.INACTIVE } });
  await logActivity(req, "CATEGORY_DEACTIVATED", "Category", item.id);
  sendSuccess(req, res, item);
}));

router.get("/esg-configuration", requireRoles(...allRoles), asyncRoute(async (req, res) => sendSuccess(req, res, (await getSettings()).esg)));
router.patch("/esg-configuration", requireRoles(Role.ADMIN), validate({ body: z.object({
  environmentalWeight: decimalString.optional(),
  socialWeight: decimalString.optional(),
  governanceWeight: decimalString.optional(),
  autoEmissionCalculation: z.boolean().optional(),
  requireCSRProof: z.boolean().optional(),
  requireChallengeProof: z.boolean().optional(),
  autoBadgeAward: z.boolean().optional(),
  emailAlertsEnabled: z.boolean().optional()
}).strict() }), asyncRoute(async (req, res) => {
  const current = (await getSettings()).esg;
  const body = req.validated!.body as any;
  const e = decimal(body.environmentalWeight ?? current.environmentalWeight);
  const s = decimal(body.socialWeight ?? current.socialWeight);
  const g = decimal(body.governanceWeight ?? current.governanceWeight);
  if (!e.plus(s).plus(g).eq(100)) throw new AppError(400, "INVALID_ESG_WEIGHTS", "ESG weights must total exactly 100.");
  const item = await db.eSGConfiguration.update({ where: { id: "default" }, data: body });
  await logActivity(req, "ESG_CONFIGURATION_UPDATED", "ESGConfiguration", item.id);
  sendSuccess(req, res, item);
}));

router.get("/notification-settings", requireRoles(...allRoles), asyncRoute(async (req, res) => sendSuccess(req, res, (await getSettings()).notification)));
router.patch("/notification-settings", requireRoles(Role.ADMIN), validate({ body: z.object({
  inAppEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  policyReminderEnabled: z.boolean().optional(),
  policyReminderDays: z.number().int().positive().optional(),
  complianceNotifications: z.boolean().optional(),
  participationNotifications: z.boolean().optional(),
  badgeNotifications: z.boolean().optional(),
  rewardNotifications: z.boolean().optional()
}).strict() }), asyncRoute(async (req, res) => {
  const item = await db.notificationSetting.update({ where: { id: "default" }, data: req.validated!.body as any });
  await logActivity(req, "NOTIFICATION_SETTINGS_UPDATED", "NotificationSetting", item.id);
  sendSuccess(req, res, item);
}));

const factorSchema = z.object({
  code: z.string().trim().min(1),
  activityName: z.string().trim().min(1),
  description: z.string().optional().nullable(),
  factorValue: decimalString,
  inputUnit: z.string().trim().min(1),
  outputUnit: z.string().trim().min(1),
  applicableSourceType: z.nativeEnum(OperationalSourceType).optional().nullable(),
  validFrom: isoDate,
  validTo: isoDate.optional().nullable(),
  status: z.nativeEnum(RecordStatus).optional()
}).strict();

router.get("/emission-factors", validate({ query: pageQuery }), asyncRoute(async (req, res) => listModel(req, res, "emissionFactor", { orderBy: { createdAt: "desc" } })));
router.post("/emission-factors", requireRoles(...adminOrManager), validate({ body: factorSchema }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  if (decimal(body.factorValue).lte(0)) throw new AppError(400, "VALIDATION_ERROR", "Factor value must be positive.");
  const item = await db.emissionFactor.create({ data: { ...body, validFrom: businessDate(body.validFrom), validTo: body.validTo ? businessDate(body.validTo) : null } });
  await logActivity(req, "EMISSION_FACTOR_CREATED", "EmissionFactor", item.id);
  sendSuccess(req, res, item, 201);
}));
router.get("/emission-factors/:id", validate({ params: idParam }), asyncRoute(async (req, res) => sendSuccess(req, res, await db.emissionFactor.findUniqueOrThrow({ where: { id: req.params.id } }))));
router.patch("/emission-factors/:id", requireRoles(...adminOrManager), validate({ params: idParam, body: factorSchema.partial().strict() }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  const item = await db.emissionFactor.update({ where: { id: req.params.id }, data: { ...body, validFrom: body.validFrom ? businessDate(body.validFrom) : undefined, validTo: body.validTo ? businessDate(body.validTo) : body.validTo } });
  await logActivity(req, "EMISSION_FACTOR_UPDATED", "EmissionFactor", item.id);
  sendSuccess(req, res, item);
}));
router.delete("/emission-factors/:id", requireRoles(...adminOrManager), validate({ params: idParam }), asyncRoute(async (req, res) => {
  const item = await db.emissionFactor.update({ where: { id: req.params.id }, data: { status: RecordStatus.INACTIVE } });
  await logActivity(req, "EMISSION_FACTOR_DEACTIVATED", "EmissionFactor", item.id);
  sendSuccess(req, res, item);
}));

const productSchema = z.object({
  productCode: z.string().trim().min(1),
  productName: z.string().trim().min(1),
  description: z.string().optional().nullable(),
  carbonFootprint: decimalString,
  recycledContentPercentage: decimalString,
  recyclablePercentage: decimalString,
  certifications: z.unknown().optional().nullable(),
  sourceNotes: z.string().optional().nullable(),
  validFrom: isoDate,
  validTo: isoDate.optional().nullable(),
  status: z.nativeEnum(RecordStatus).optional()
}).strict();

router.get("/product-esg-profiles", validate({ query: pageQuery }), asyncRoute(async (req, res) => listModel(req, res, "productESGProfile", { orderBy: { createdAt: "desc" } })));
router.post("/product-esg-profiles", requireRoles(...adminOrManager), validate({ body: productSchema }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  for (const field of ["recycledContentPercentage", "recyclablePercentage"]) {
    const value = decimal(body[field]);
    if (value.lt(0) || value.gt(100)) throw new AppError(400, "VALIDATION_ERROR", `${field} must be between 0 and 100.`);
  }
  const item = await db.productESGProfile.create({ data: { ...body, validFrom: businessDate(body.validFrom), validTo: body.validTo ? businessDate(body.validTo) : null } });
  await logActivity(req, "PRODUCT_ESG_PROFILE_CREATED", "ProductESGProfile", item.id);
  sendSuccess(req, res, item, 201);
}));
router.get("/product-esg-profiles/:id", validate({ params: idParam }), asyncRoute(async (req, res) => sendSuccess(req, res, await db.productESGProfile.findUniqueOrThrow({ where: { id: req.params.id } }))));
router.patch("/product-esg-profiles/:id", requireRoles(...adminOrManager), validate({ params: idParam, body: productSchema.partial().strict() }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  const item = await db.productESGProfile.update({ where: { id: req.params.id }, data: { ...body, validFrom: body.validFrom ? businessDate(body.validFrom) : undefined, validTo: body.validTo ? businessDate(body.validTo) : body.validTo } });
  await logActivity(req, "PRODUCT_ESG_PROFILE_UPDATED", "ProductESGProfile", item.id);
  sendSuccess(req, res, item);
}));
router.delete("/product-esg-profiles/:id", requireRoles(...adminOrManager), validate({ params: idParam }), asyncRoute(async (req, res) => {
  const item = await db.productESGProfile.update({ where: { id: req.params.id }, data: { status: RecordStatus.INACTIVE } });
  await logActivity(req, "PRODUCT_ESG_PROFILE_DEACTIVATED", "ProductESGProfile", item.id);
  sendSuccess(req, res, item);
}));

const carbonSchema = z.object({
  departmentId: z.string().uuid(),
  emissionFactorId: z.string().uuid(),
  quantity: decimalString,
  transactionDate: isoDate,
  sourceType: z.nativeEnum(OperationalSourceType).optional(),
  sourceSystem: z.string().optional(),
  externalReference: z.string().optional(),
  sourceMetadata: z.record(z.string(), z.unknown()).optional()
}).strict();

router.get("/carbon-transactions", validate({ query: pageQuery }), asyncRoute(async (req, res) => listModel(req, res, "carbonTransaction", { include: { department: true, emissionFactor: true }, orderBy: { createdAt: "desc" } })));
router.get("/carbon-transactions/:id", validate({ params: idParam }), asyncRoute(async (req, res) => sendSuccess(req, res, await db.carbonTransaction.findUniqueOrThrow({ where: { id: req.params.id }, include: { department: true, emissionFactor: true } }))));
router.post("/carbon-transactions", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.EMPLOYEE), validate({ body: carbonSchema }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  if (decimal(body.quantity).lte(0)) throw new AppError(400, "VALIDATION_ERROR", "Quantity must be positive.");
  const date = businessDate(body.transactionDate);
  const factor = await activeFactor(body.emissionFactorId, date);
  const item = await db.carbonTransaction.create({
    data: {
      departmentId: body.departmentId,
      emissionFactorId: body.emissionFactorId,
      loggedById: req.auth!.id,
      quantity: body.quantity,
      factorValueSnapshot: factor.factorValue,
      inputUnitSnapshot: factor.inputUnit,
      calculatedEmission: calculatedEmission(body.quantity, factor.factorValue),
      transactionDate: date,
      sourceType: body.sourceType,
      sourceSystem: body.sourceSystem,
      externalReference: body.externalReference,
      sourceMetadata: body.sourceMetadata
    }
  });
  await logActivity(req, "CARBON_TRANSACTION_CREATED", "CarbonTransaction", item.id);
  sendSuccess(req, res, item, 201);
}));

const operationalSchema = z.object({
  sourceType: z.nativeEnum(OperationalSourceType),
  sourceSystem: z.string().trim().min(1),
  externalReference: z.string().trim().min(1),
  departmentId: z.string().uuid(),
  emissionFactorId: z.string().uuid(),
  quantity: decimalString,
  occurredOn: isoDate,
  metadata: z.record(z.string(), z.unknown()).optional()
}).strict();

router.post("/integrations/operational-emissions/preview", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.EMPLOYEE), validate({ body: operationalSchema }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  if (decimal(body.quantity).lte(0)) throw new AppError(400, "VALIDATION_ERROR", "Quantity must be positive.");
  const factor = await activeFactor(body.emissionFactorId, businessDate(body.occurredOn));
  sendSuccess(req, res, { factor, quantity: body.quantity, calculatedEmission: calculatedEmission(body.quantity, factor.factorValue) });
}));

router.post("/integrations/operational-emissions", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.EMPLOYEE), validate({ body: operationalSchema }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  const { esg } = await getSettings();
  if (!esg.autoEmissionCalculation) throw new AppError(400, "INVALID_STATE", "Automatic emission calculation is disabled.");
  const existing = await db.operationalEmissionEvent.findUnique({ where: { sourceSystem_externalReference: { sourceSystem: body.sourceSystem, externalReference: body.externalReference } } });
  if (existing) throw new AppError(409, "DUPLICATE_OPERATIONAL_EVENT", "This operational event was already ingested.");
  const item = await db.$transaction(async (tx: any) => {
    const factor = await activeFactor(body.emissionFactorId, businessDate(body.occurredOn), tx);
    const event = await tx.operationalEmissionEvent.create({
      data: {
        ...body,
        occurredOn: businessDate(body.occurredOn),
        factorValueSnapshot: factor.factorValue,
        inputUnitSnapshot: factor.inputUnit,
        calculatedEmission: calculatedEmission(body.quantity, factor.factorValue),
        createdById: req.auth!.id
      }
    });
    const transaction = await tx.carbonTransaction.create({
      data: {
        departmentId: body.departmentId,
        emissionFactorId: body.emissionFactorId,
        operationalEventId: event.id,
        loggedById: req.auth!.id,
        quantity: body.quantity,
        factorValueSnapshot: factor.factorValue,
        inputUnitSnapshot: factor.inputUnit,
        calculatedEmission: event.calculatedEmission,
        transactionDate: businessDate(body.occurredOn),
        sourceType: body.sourceType,
        sourceSystem: body.sourceSystem,
        externalReference: body.externalReference,
        sourceMetadata: body.metadata
      }
    });
    await logActivity(req, "OPERATIONAL_EMISSION_INGESTED", "OperationalEmissionEvent", event.id, { carbonTransactionId: transaction.id }, tx);
    return { event, carbonTransaction: transaction };
  });
  sendSuccess(req, res, item, 201);
}));

const goalSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().optional().nullable(),
  departmentId: z.string().uuid(),
  targetCo2: decimalString,
  currentCo2: decimalString,
  baselineCo2: decimalString.optional().nullable(),
  startDate: isoDate,
  deadline: isoDate,
  status: z.nativeEnum(GoalStatus).optional()
}).strict();

function withGoalProgress(goal: any) {
  const target = decimal(goal.targetCo2);
  const current = decimal(goal.currentCo2);
  return { ...goal, progress: target.lte(0) ? "0" : Prisma.Decimal.min(100, current.div(target).mul(100)).toFixed(2) };
}

router.get("/environmental-goals", validate({ query: pageQuery }), asyncRoute(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const where: any = {};
  if (req.query.departmentId) where.departmentId = req.query.departmentId;
  if (req.query.status) where.status = req.query.status;
  const [items, total] = await Promise.all([db.environmentalGoal.findMany({ where, skip, take: limit, orderBy: { deadline: "asc" } }), db.environmentalGoal.count({ where })]);
  sendPage(req, res, items.map(withGoalProgress), page, limit, total);
}));
router.post("/environmental-goals", requireRoles(...adminOrManager), validate({ body: goalSchema }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  if (decimal(body.targetCo2).lte(0) || decimal(body.currentCo2).lt(0)) throw new AppError(400, "VALIDATION_ERROR", "Goal values must be valid.");
  const item = await db.environmentalGoal.create({ data: { ...body, startDate: businessDate(body.startDate), deadline: businessDate(body.deadline) } });
  await logActivity(req, "ENVIRONMENTAL_GOAL_CREATED", "EnvironmentalGoal", item.id);
  sendSuccess(req, res, withGoalProgress(item), 201);
}));
router.get("/environmental-goals/:id", validate({ params: idParam }), asyncRoute(async (req, res) => sendSuccess(req, res, withGoalProgress(await db.environmentalGoal.findUniqueOrThrow({ where: { id: req.params.id } })))));
router.patch("/environmental-goals/:id", requireRoles(...adminOrManager), validate({ params: idParam, body: goalSchema.partial().strict() }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  const item = await db.environmentalGoal.update({ where: { id: req.params.id }, data: { ...body, startDate: body.startDate ? businessDate(body.startDate) : undefined, deadline: body.deadline ? businessDate(body.deadline) : undefined } });
  await logActivity(req, "ENVIRONMENTAL_GOAL_UPDATED", "EnvironmentalGoal", item.id);
  sendSuccess(req, res, withGoalProgress(item));
}));
router.delete("/environmental-goals/:id", requireRoles(...adminOrManager), validate({ params: idParam }), asyncRoute(async (req, res) => {
  const item = await db.environmentalGoal.update({ where: { id: req.params.id }, data: { status: GoalStatus.ARCHIVED } });
  await logActivity(req, "ENVIRONMENTAL_GOAL_ARCHIVED", "EnvironmentalGoal", item.id);
  sendSuccess(req, res, withGoalProgress(item));
}));

async function listModel(req: AppRequest, res: any, model: string, options: any = {}) {
  const { page, limit, skip } = parsePagination(req.query);
  const where: any = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.departmentId) where.departmentId = req.query.departmentId;
  if (req.query.employeeId) where.employeeId = req.query.employeeId;
  if (req.query.categoryId) where.categoryId = req.query.categoryId;
  const [items, total] = await Promise.all([
    db[model].findMany({ where, skip, take: limit, ...options }),
    db[model].count({ where })
  ]);
  sendPage(req, res, items, page, limit, total);
}

const csrSchema = z.object({
  title: z.string().trim().min(1),
  categoryId: z.string().uuid(),
  description: z.string().optional().nullable(),
  evidenceRequired: z.boolean().optional(),
  pointsAwarded: z.number().int().positive(),
  eventDate: isoDate,
  registrationDeadline: isoDate.optional().nullable(),
  status: z.nativeEnum(ActivityStatus).optional()
}).strict();

router.get("/csr-activities", validate({ query: pageQuery }), asyncRoute(async (req, res) => listModel(req, res, "cSRActivity", { include: { category: true }, orderBy: { eventDate: "desc" } })));
router.post("/csr-activities", requireRoles(...adminOrManager), validate({ body: csrSchema }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  const category = await db.category.findUnique({ where: { id: body.categoryId } });
  if (!category || category.type !== CategoryType.CSR_ACTIVITY || category.status !== RecordStatus.ACTIVE) throw new AppError(400, "VALIDATION_ERROR", "An active CSR category is required.");
  const item = await db.cSRActivity.create({ data: { ...body, eventDate: businessDate(body.eventDate), registrationDeadline: body.registrationDeadline ? businessDate(body.registrationDeadline) : null, createdById: req.auth!.id } });
  await logActivity(req, "CSR_ACTIVITY_CREATED", "CSRActivity", item.id);
  sendSuccess(req, res, item, 201);
}));
router.get("/csr-activities/:id", validate({ params: idParam }), asyncRoute(async (req, res) => sendSuccess(req, res, await db.cSRActivity.findUniqueOrThrow({ where: { id: req.params.id }, include: { category: true } }))));
router.patch("/csr-activities/:id", requireRoles(...adminOrManager), validate({ params: idParam, body: csrSchema.partial().strict() }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  const item = await db.cSRActivity.update({ where: { id: req.params.id }, data: { ...body, eventDate: body.eventDate ? businessDate(body.eventDate) : undefined, registrationDeadline: body.registrationDeadline ? businessDate(body.registrationDeadline) : body.registrationDeadline } });
  await logActivity(req, "CSR_ACTIVITY_UPDATED", "CSRActivity", item.id);
  sendSuccess(req, res, item);
}));
router.delete("/csr-activities/:id", requireRoles(...adminOrManager), validate({ params: idParam }), asyncRoute(async (req, res) => {
  const item = await db.cSRActivity.update({ where: { id: req.params.id }, data: { status: ActivityStatus.ARCHIVED } });
  await logActivity(req, "CSR_ACTIVITY_ARCHIVED", "CSRActivity", item.id);
  sendSuccess(req, res, item);
}));
router.post("/csr-activities/:id/join", requireRoles(Role.EMPLOYEE), validate({ params: idParam }), asyncRoute(async (req, res) => {
  const activity = await db.cSRActivity.findUniqueOrThrow({ where: { id: req.params.id } });
  if (activity.status !== ActivityStatus.ACTIVE) throw new AppError(400, "INVALID_STATE", "Only active activities can be joined.");
  try {
    const item = await db.employeeParticipation.create({ data: { employeeId: req.auth!.id, activityId: activity.id } });
    await logActivity(req, "CSR_ACTIVITY_JOINED", "EmployeeParticipation", item.id);
    sendSuccess(req, res, item, 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new AppError(409, "DUPLICATE_PARTICIPATION", "You already joined this activity.");
    throw error;
  }
}));

router.get("/participations/mine", requireRoles(Role.EMPLOYEE), validate({ query: pageQuery }), asyncRoute(async (req, res) => {
  req.query.employeeId = req.auth!.id;
  return listModel(req, res, "employeeParticipation", { include: { activity: true }, orderBy: { createdAt: "desc" } });
}));
router.get("/participations", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR), validate({ query: pageQuery }), asyncRoute(async (req, res) => listModel(req, res, "employeeParticipation", { include: { employee: true, activity: true }, orderBy: { createdAt: "desc" } })));
router.get("/participations/:id", validate({ params: idParam }), asyncRoute(async (req, res) => {
  const item = await db.employeeParticipation.findUniqueOrThrow({ where: { id: req.params.id }, include: { employee: true, activity: true } });
  ownOrPrivileged(req, item.employeeId);
  sendSuccess(req, res, item);
}));
router.patch("/participations/:id/proof", requireRoles(Role.EMPLOYEE), validate({ params: idParam, body: z.object({ proofUrl: safeUrl() }).strict() }), asyncRoute(async (req, res) => {
  const item = await db.employeeParticipation.findUniqueOrThrow({ where: { id: req.params.id } });
  ownOrPrivileged(req, item.employeeId);
  const updated = await db.employeeParticipation.update({ where: { id: item.id }, data: { proofUrl: (req.validated!.body as any).proofUrl } });
  sendSuccess(req, res, updated);
}));

async function decideParticipation(req: AppRequest, res: any, approved: boolean) {
  const participation = await db.employeeParticipation.findUniqueOrThrow({ where: { id: req.params.id }, include: { activity: true } });
  if (participation.employeeId === req.auth!.id) throw new AppError(403, "SELF_APPROVAL_FORBIDDEN", "You cannot approve your own work.");
  if (participation.approvalStatus !== ApprovalStatus.PENDING) throw new AppError(400, "INVALID_STATE", "Participation has already been reviewed.");
  const { esg } = await getSettings();
  if (approved && (participation.activity.evidenceRequired || esg.requireCSRProof) && !participation.proofUrl) throw new AppError(400, "PROOF_REQUIRED", "Proof is required before approval.");
  const item = await db.$transaction(async (tx: any) => {
    const updated = await tx.employeeParticipation.update({
      where: { id: participation.id },
      data: {
        approvalStatus: approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED,
        pointsEarned: approved ? participation.activity.pointsAwarded : 0,
        completionDate: approved ? new Date() : null,
        reviewedById: req.auth!.id,
        reviewedAt: new Date(),
        reviewComment: (req.body.reviewComment as string | undefined) ?? null
      }
    });
    await notify(participation.employeeId, approved ? NotificationType.PARTICIPATION_APPROVED : NotificationType.PARTICIPATION_REJECTED, approved ? "CSR approved" : "CSR rejected", approved ? "Your CSR participation was approved." : "Your CSR participation was rejected.", "EmployeeParticipation", participation.id, tx);
    if (approved) await evaluateBadges(participation.employeeId, req, tx);
    await logActivity(req, approved ? "CSR_PARTICIPATION_APPROVED" : "CSR_PARTICIPATION_REJECTED", "EmployeeParticipation", participation.id, undefined, tx);
    return updated;
  });
  sendSuccess(req, res, item);
}
router.patch("/participations/:id/approve", requireRoles(...adminOrManager), validate({ params: idParam, body: z.object({ reviewComment: z.string().optional() }).partial() }), asyncRoute(async (req, res) => decideParticipation(req, res, true)));
router.patch("/participations/:id/reject", requireRoles(...adminOrManager), validate({ params: idParam, body: z.object({ reviewComment: z.string().optional() }).partial() }), asyncRoute(async (req, res) => decideParticipation(req, res, false)));

const diversitySchema = z.object({
  departmentId: z.string().uuid().nullable().optional(),
  snapshotDate: isoDate,
  totalEmployees: z.number().int().nonnegative(),
  femaleEmployees: z.number().int().nonnegative(),
  maleEmployees: z.number().int().nonnegative(),
  nonBinaryEmployees: z.number().int().nonnegative(),
  undisclosedEmployees: z.number().int().nonnegative(),
  underrepresentedEmployees: z.number().int().nonnegative(),
  metadata: z.record(z.string(), z.unknown()).optional()
}).strict();
router.get("/social/diversity", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR), asyncRoute(async (req, res) => {
  const latest = await db.diversitySnapshot.findMany({ orderBy: { snapshotDate: "desc" }, take: 20, include: { department: true } });
  sendSuccess(req, res, { snapshots: latest });
}));
router.get("/diversity-snapshots", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR), validate({ query: pageQuery }), asyncRoute(async (req, res) => listModel(req, res, "diversitySnapshot", { include: { department: true }, orderBy: { snapshotDate: "desc" } })));
router.post("/diversity-snapshots", requireRoles(Role.ADMIN, Role.ESG_MANAGER), validate({ body: diversitySchema }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  const known = body.femaleEmployees + body.maleEmployees + body.nonBinaryEmployees + body.undisclosedEmployees;
  if (known > body.totalEmployees) throw new AppError(400, "VALIDATION_ERROR", "Diversity counts cannot exceed total employees.");
  const item = await db.diversitySnapshot.create({ data: { ...body, snapshotDate: businessDate(body.snapshotDate) } });
  sendSuccess(req, res, item, 201);
}));
router.patch("/diversity-snapshots/:id", requireRoles(Role.ADMIN, Role.ESG_MANAGER), validate({ params: idParam, body: diversitySchema.partial().strict() }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  sendSuccess(req, res, await db.diversitySnapshot.update({ where: { id: req.params.id }, data: { ...body, snapshotDate: body.snapshotDate ? businessDate(body.snapshotDate) : undefined } }));
}));

const trainingSchema = z.object({
  employeeId: z.string().uuid().optional(),
  title: z.string().trim().min(1),
  provider: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  hours: decimalString,
  status: z.nativeEnum(TrainingStatus).optional(),
  startedOn: isoDate.optional().nullable(),
  completedOn: isoDate.optional().nullable(),
  certificateUrl: safeUrl(true),
  sustainabilityRelated: z.boolean().optional()
}).strict();
router.get("/training-records/mine", requireRoles(Role.EMPLOYEE), validate({ query: pageQuery }), asyncRoute(async (req, res) => {
  req.query.employeeId = req.auth!.id;
  return listModel(req, res, "trainingRecord", { orderBy: { createdAt: "desc" } });
}));
router.get("/training-records", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR), validate({ query: pageQuery }), asyncRoute(async (req, res) => listModel(req, res, "trainingRecord", { include: { employee: true }, orderBy: { createdAt: "desc" } })));
router.post("/training-records", validate({ body: trainingSchema }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  const employeeId = req.auth!.role === Role.EMPLOYEE ? req.auth!.id : (body.employeeId ?? req.auth!.id);
  const item = await db.trainingRecord.create({ data: { ...body, employeeId, startedOn: body.startedOn ? businessDate(body.startedOn) : null, completedOn: body.completedOn ? businessDate(body.completedOn) : null } });
  sendSuccess(req, res, item, 201);
}));
router.patch("/training-records/:id", validate({ params: idParam, body: trainingSchema.partial().strict() }), asyncRoute(async (req, res) => {
  const existing = await db.trainingRecord.findUniqueOrThrow({ where: { id: req.params.id } });
  ownOrPrivileged(req, existing.employeeId);
  const body = req.validated!.body as any;
  sendSuccess(req, res, await db.trainingRecord.update({ where: { id: existing.id }, data: { ...body, startedOn: body.startedOn ? businessDate(body.startedOn) : undefined, completedOn: body.completedOn ? businessDate(body.completedOn) : undefined } }));
}));
router.get("/social/training-summary", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR), asyncRoute(async (req, res) => {
  const [total, completed, hours] = await Promise.all([
    db.trainingRecord.count(),
    db.trainingRecord.count({ where: { status: TrainingStatus.COMPLETED } }),
    db.trainingRecord.aggregate({ where: { status: TrainingStatus.COMPLETED }, _sum: { hours: true } })
  ]);
  sendSuccess(req, res, { total, completed, completedHours: hours._sum.hours ?? "0" });
}));

const policySchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional().nullable(),
  documentUrl: safeUrl(),
  status: z.nativeEnum(PolicyStatus).optional()
}).strict();
router.get("/policies", validate({ query: pageQuery }), asyncRoute(async (req, res) => listModel(req, res, "eSGPolicy", { orderBy: { createdAt: "desc" } })));
router.post("/policies", requireRoles(...adminOrManager), validate({ body: policySchema }), asyncRoute(async (req, res) => {
  const item = await db.eSGPolicy.create({ data: { ...(req.validated!.body as any), createdById: req.auth!.id } });
  await logActivity(req, "POLICY_CREATED", "ESGPolicy", item.id);
  sendSuccess(req, res, item, 201);
}));
router.get("/policies/:id", validate({ params: idParam }), asyncRoute(async (req, res) => sendSuccess(req, res, await db.eSGPolicy.findUniqueOrThrow({ where: { id: req.params.id } }))));
router.patch("/policies/:id", requireRoles(...adminOrManager), validate({ params: idParam, body: policySchema.partial().strict() }), asyncRoute(async (req, res) => {
  const item = await db.eSGPolicy.update({ where: { id: req.params.id }, data: req.validated!.body as any });
  await logActivity(req, "POLICY_UPDATED", "ESGPolicy", item.id);
  sendSuccess(req, res, item);
}));
router.delete("/policies/:id", requireRoles(...adminOrManager), validate({ params: idParam }), asyncRoute(async (req, res) => {
  const item = await db.eSGPolicy.update({ where: { id: req.params.id }, data: { status: PolicyStatus.ARCHIVED } });
  await logActivity(req, "POLICY_ARCHIVED", "ESGPolicy", item.id);
  sendSuccess(req, res, item);
}));
router.post("/policies/:id/publish", requireRoles(...adminOrManager), validate({ params: idParam }), asyncRoute(async (req, res) => {
  const item = await db.$transaction(async (tx: any) => {
    const policy = await tx.eSGPolicy.update({ where: { id: req.params.id }, data: { status: PolicyStatus.PUBLISHED, publishedAt: new Date() } });
    const users = await tx.user.findMany({ where: { isActive: true, role: Role.EMPLOYEE } });
    for (const user of users) await notify(user.id, NotificationType.POLICY_PUBLISHED, "Policy published", policy.title, "ESGPolicy", policy.id, tx);
    await logActivity(req, "POLICY_PUBLISHED", "ESGPolicy", policy.id, undefined, tx);
    return policy;
  });
  sendSuccess(req, res, item);
}));
router.post("/policies/:id/acknowledge", requireRoles(Role.EMPLOYEE), validate({ params: idParam }), asyncRoute(async (req, res) => {
  const policy = await db.eSGPolicy.findUniqueOrThrow({ where: { id: req.params.id } });
  if (policy.status !== PolicyStatus.PUBLISHED) throw new AppError(400, "INVALID_STATE", "Only published policies can be acknowledged.");
  const item = await db.policyAcknowledgement.upsert({
    where: { policyId_employeeId: { policyId: policy.id, employeeId: req.auth!.id } },
    update: {},
    create: { policyId: policy.id, employeeId: req.auth!.id }
  });
  await logActivity(req, "POLICY_ACKNOWLEDGED", "PolicyAcknowledgement", item.id);
  sendSuccess(req, res, item);
}));
router.get("/policies/:id/acknowledgements", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR), validate({ params: idParam }), asyncRoute(async (req, res) => sendSuccess(req, res, await db.policyAcknowledgement.findMany({ where: { policyId: req.params.id }, include: { employee: true } }))));

const auditSchema = z.object({
  title: z.string().trim().min(1),
  departmentId: z.string().uuid(),
  auditorId: z.string().uuid(),
  scopeStart: isoDate,
  scopeEnd: isoDate,
  findings: z.string().optional().nullable(),
  status: z.nativeEnum(AuditStatus).optional()
}).strict();
router.get("/audits", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR), validate({ query: pageQuery }), asyncRoute(async (req, res) => listModel(req, res, "audit", { include: { department: true, auditor: true }, orderBy: { createdAt: "desc" } })));
router.post("/audits", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR), validate({ body: auditSchema }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  const item = await db.audit.create({ data: { ...body, scopeStart: businessDate(body.scopeStart), scopeEnd: businessDate(body.scopeEnd) } });
  await logActivity(req, "AUDIT_CREATED", "Audit", item.id);
  sendSuccess(req, res, item, 201);
}));
router.get("/audits/:id", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR), validate({ params: idParam }), asyncRoute(async (req, res) => sendSuccess(req, res, await db.audit.findUniqueOrThrow({ where: { id: req.params.id } }))));
router.patch("/audits/:id", requireRoles(Role.ADMIN, Role.ESG_MANAGER), validate({ params: idParam, body: auditSchema.partial().strict() }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  sendSuccess(req, res, await db.audit.update({ where: { id: req.params.id }, data: { ...body, scopeStart: body.scopeStart ? businessDate(body.scopeStart) : undefined, scopeEnd: body.scopeEnd ? businessDate(body.scopeEnd) : undefined } }));
}));
router.post("/audits/:id/start", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR), validate({ params: idParam }), asyncRoute(async (req, res) => transitionAudit(req, res, AuditStatus.SCHEDULED, AuditStatus.UNDER_REVIEW, "AUDIT_STARTED")));
router.post("/audits/:id/close", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR), validate({ params: idParam, body: z.object({ findings: z.string().optional() }).partial() }), asyncRoute(async (req, res) => transitionAudit(req, res, AuditStatus.UNDER_REVIEW, AuditStatus.COMPLETED, "AUDIT_CLOSED")));

async function transitionAudit(req: AppRequest, res: any, from: AuditStatus, to: AuditStatus, action: string) {
  const audit = await db.audit.findUniqueOrThrow({ where: { id: req.params.id } });
  if (req.auth!.role === Role.AUDITOR && audit.auditorId !== req.auth!.id) throw new AppError(403, "FORBIDDEN", "Auditors can manage only assigned audits.");
  if (audit.status !== from) throw new AppError(400, "INVALID_STATE", "Audit transition is not allowed.");
  const item = await db.audit.update({ where: { id: audit.id }, data: { status: to, findings: req.body.findings ?? audit.findings } });
  await logActivity(req, action, "Audit", item.id);
  sendSuccess(req, res, item);
}

const complianceSchema = z.object({
  auditId: z.string().uuid().nullable().optional(),
  departmentId: z.string().uuid(),
  description: z.string().trim().min(1),
  severity: z.nativeEnum(Severity),
  ownerId: z.string().uuid(),
  dueDate: isoDate,
  status: z.nativeEnum(ComplianceIssueStatus).optional(),
  resolutionNotes: z.string().optional().nullable()
}).strict();
router.get("/compliance-issues", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR, Role.EMPLOYEE), validate({ query: pageQuery }), asyncRoute(async (req, res) => {
  if (req.auth!.role === Role.EMPLOYEE) req.query.employeeId = req.auth!.id;
  const { page, limit, skip } = parsePagination(req.query);
  const where: any = {};
  if (req.auth!.role === Role.EMPLOYEE) where.ownerId = req.auth!.id;
  if (req.query.departmentId) where.departmentId = req.query.departmentId;
  if (req.query.status) where.status = req.query.status;
  const [items, total] = await Promise.all([db.complianceIssue.findMany({ where, include: { owner: true, department: true }, skip, take: limit, orderBy: { dueDate: "asc" } }), db.complianceIssue.count({ where })]);
  sendPage(req, res, items, page, limit, total);
}));
router.post("/compliance-issues", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR), validate({ body: complianceSchema }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  const item = await db.complianceIssue.create({ data: { ...body, dueDate: businessDate(body.dueDate), createdById: req.auth!.id } });
  await notify(item.ownerId, NotificationType.COMPLIANCE_ASSIGNED, "Compliance issue assigned", item.description, "ComplianceIssue", item.id);
  await logActivity(req, "COMPLIANCE_ISSUE_CREATED", "ComplianceIssue", item.id);
  sendSuccess(req, res, item, 201);
}));
router.get("/compliance-issues/:id", validate({ params: idParam }), asyncRoute(async (req, res) => {
  const item = await db.complianceIssue.findUniqueOrThrow({ where: { id: req.params.id } });
  if (req.auth!.role === Role.EMPLOYEE && item.ownerId !== req.auth!.id) throw new AppError(403, "FORBIDDEN", "Employees can only access assigned compliance issues.");
  sendSuccess(req, res, item);
}));
router.patch("/compliance-issues/:id", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR), validate({ params: idParam, body: complianceSchema.partial().strict() }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  sendSuccess(req, res, await db.complianceIssue.update({ where: { id: req.params.id }, data: { ...body, dueDate: body.dueDate ? businessDate(body.dueDate) : undefined } }));
}));
router.patch("/compliance-issues/:id/assign", requireRoles(Role.ADMIN, Role.ESG_MANAGER), validate({ params: idParam, body: z.object({ ownerId: z.string().uuid() }).strict() }), asyncRoute(async (req, res) => {
  const item = await db.complianceIssue.update({ where: { id: req.params.id }, data: { ownerId: (req.validated!.body as any).ownerId } });
  await notify(item.ownerId, NotificationType.COMPLIANCE_ASSIGNED, "Compliance issue assigned", item.description, "ComplianceIssue", item.id);
  sendSuccess(req, res, item);
}));
router.patch("/compliance-issues/:id/resolve", validate({ params: idParam, body: z.object({ resolutionNotes: z.string().optional() }).partial() }), asyncRoute(async (req, res) => {
  const issue = await db.complianceIssue.findUniqueOrThrow({ where: { id: req.params.id } });
  if (req.auth!.role !== Role.ADMIN && req.auth!.role !== Role.ESG_MANAGER && issue.ownerId !== req.auth!.id) throw new AppError(403, "FORBIDDEN", "You cannot resolve this issue.");
  if (issue.status === ComplianceIssueStatus.RESOLVED) throw new AppError(400, "INVALID_STATE", "Compliance issue is already resolved.");
  const item = await db.complianceIssue.update({ where: { id: issue.id }, data: { status: ComplianceIssueStatus.RESOLVED, resolvedAt: new Date(), isOverdue: false, resolutionNotes: (req.validated!.body as any).resolutionNotes } });
  await logActivity(req, "COMPLIANCE_ISSUE_RESOLVED", "ComplianceIssue", item.id);
  sendSuccess(req, res, item);
}));

const challengeSchema = z.object({
  title: z.string().trim().min(1),
  categoryId: z.string().uuid(),
  description: z.string().optional().nullable(),
  xp: z.number().int().positive(),
  difficulty: z.nativeEnum(Difficulty),
  evidenceRequired: z.boolean().optional(),
  startDate: isoDate,
  deadline: isoDate,
  status: z.nativeEnum(ChallengeStatus).optional()
}).strict();
router.get("/challenges", validate({ query: pageQuery }), asyncRoute(async (req, res) => listModel(req, res, "challenge", { include: { category: true }, orderBy: { deadline: "asc" } })));
router.post("/challenges", requireRoles(...adminOrManager), validate({ body: challengeSchema }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  const category = await db.category.findUnique({ where: { id: body.categoryId } });
  if (!category || category.type !== CategoryType.CHALLENGE || category.status !== RecordStatus.ACTIVE) throw new AppError(400, "VALIDATION_ERROR", "An active challenge category is required.");
  const item = await db.challenge.create({ data: { ...body, startDate: businessDate(body.startDate), deadline: businessDate(body.deadline), createdById: req.auth!.id } });
  sendSuccess(req, res, item, 201);
}));
router.get("/challenges/:id", validate({ params: idParam }), asyncRoute(async (req, res) => sendSuccess(req, res, await db.challenge.findUniqueOrThrow({ where: { id: req.params.id }, include: { category: true } }))));
router.patch("/challenges/:id", requireRoles(...adminOrManager), validate({ params: idParam, body: challengeSchema.partial().strict() }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  sendSuccess(req, res, await db.challenge.update({ where: { id: req.params.id }, data: { ...body, startDate: body.startDate ? businessDate(body.startDate) : undefined, deadline: body.deadline ? businessDate(body.deadline) : undefined } }));
}));
router.delete("/challenges/:id", requireRoles(...adminOrManager), validate({ params: idParam }), asyncRoute(async (req, res) => sendSuccess(req, res, await db.challenge.update({ where: { id: req.params.id }, data: { status: ChallengeStatus.ARCHIVED } }))));
router.post("/challenges/:id/join", requireRoles(Role.EMPLOYEE), validate({ params: idParam }), asyncRoute(async (req, res) => {
  const challenge = await db.challenge.findUniqueOrThrow({ where: { id: req.params.id } });
  if (challenge.status !== ChallengeStatus.ACTIVE) throw new AppError(400, "INVALID_STATE", "Only active challenges can be joined.");
  try {
    sendSuccess(req, res, await db.challengeParticipation.create({ data: { employeeId: req.auth!.id, challengeId: challenge.id } }), 201);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new AppError(409, "DUPLICATE_PARTICIPATION", "You already joined this challenge.");
    throw error;
  }
}));

router.get("/challenge-participations/mine", requireRoles(Role.EMPLOYEE), validate({ query: pageQuery }), asyncRoute(async (req, res) => {
  req.query.employeeId = req.auth!.id;
  return listModel(req, res, "challengeParticipation", { include: { challenge: true }, orderBy: { createdAt: "desc" } });
}));
router.get("/challenge-participations", requireRoles(Role.ADMIN, Role.ESG_MANAGER), validate({ query: pageQuery }), asyncRoute(async (req, res) => listModel(req, res, "challengeParticipation", { include: { employee: true, challenge: true }, orderBy: { createdAt: "desc" } })));
router.get("/challenge-participations/:id", validate({ params: idParam }), asyncRoute(async (req, res) => {
  const item = await db.challengeParticipation.findUniqueOrThrow({ where: { id: req.params.id }, include: { challenge: true } });
  ownOrPrivileged(req, item.employeeId);
  sendSuccess(req, res, item);
}));
router.patch("/challenge-participations/:id/progress", requireRoles(Role.EMPLOYEE), validate({ params: idParam, body: z.object({ progress: z.number().int().min(0).max(100), proofUrl: safeUrl(true) }).strict() }), asyncRoute(async (req, res) => {
  const item = await db.challengeParticipation.findUniqueOrThrow({ where: { id: req.params.id } });
  ownOrPrivileged(req, item.employeeId);
  sendSuccess(req, res, await db.challengeParticipation.update({ where: { id: item.id }, data: req.validated!.body as any }));
}));
router.post("/challenge-participations/:id/submit", requireRoles(Role.EMPLOYEE), validate({ params: idParam }), asyncRoute(async (req, res) => {
  const item = await db.challengeParticipation.findUniqueOrThrow({ where: { id: req.params.id } });
  ownOrPrivileged(req, item.employeeId);
  sendSuccess(req, res, await db.challengeParticipation.update({ where: { id: item.id }, data: { submittedAt: new Date() } }));
}));
async function decideChallenge(req: AppRequest, res: any, approved: boolean) {
  const participation = await db.challengeParticipation.findUniqueOrThrow({ where: { id: req.params.id }, include: { challenge: true } });
  if (participation.employeeId === req.auth!.id) throw new AppError(403, "SELF_APPROVAL_FORBIDDEN", "You cannot approve your own work.");
  if (participation.approvalStatus !== ApprovalStatus.PENDING) throw new AppError(400, "INVALID_STATE", "Challenge participation has already been reviewed.");
  const { esg } = await getSettings();
  if (approved && (participation.challenge.evidenceRequired || esg.requireChallengeProof) && !participation.proofUrl) throw new AppError(400, "PROOF_REQUIRED", "Proof is required before approval.");
  const item = await db.$transaction(async (tx: any) => {
    const updated = await tx.challengeParticipation.update({ where: { id: participation.id }, data: { approvalStatus: approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED, xpAwarded: approved ? participation.challenge.xp : 0, reviewedById: req.auth!.id, reviewedAt: new Date(), reviewComment: req.body.reviewComment ?? null } });
    await notify(participation.employeeId, approved ? NotificationType.PARTICIPATION_APPROVED : NotificationType.PARTICIPATION_REJECTED, approved ? "Challenge approved" : "Challenge rejected", approved ? "Your challenge submission was approved." : "Your challenge submission was rejected.", "ChallengeParticipation", participation.id, tx);
    if (approved) await evaluateBadges(participation.employeeId, req, tx);
    await logActivity(req, approved ? "CHALLENGE_APPROVED" : "CHALLENGE_REJECTED", "ChallengeParticipation", participation.id, undefined, tx);
    return updated;
  });
  sendSuccess(req, res, item);
}
router.patch("/challenge-participations/:id/approve", requireRoles(...adminOrManager), validate({ params: idParam, body: z.object({ reviewComment: z.string().optional() }).partial() }), asyncRoute(async (req, res) => decideChallenge(req, res, true)));
router.patch("/challenge-participations/:id/reject", requireRoles(...adminOrManager), validate({ params: idParam, body: z.object({ reviewComment: z.string().optional() }).partial() }), asyncRoute(async (req, res) => decideChallenge(req, res, false)));

const badgeSchema = z.object({ name: z.string().min(1), description: z.string().optional().nullable(), unlockRule: z.string().min(1), icon: safeUrl(true), status: z.nativeEnum(BadgeStatus).optional() }).strict();
router.get("/badges/mine", requireRoles(Role.EMPLOYEE), asyncRoute(async (req, res) => sendSuccess(req, res, await db.employeeBadge.findMany({ where: { employeeId: req.auth!.id }, include: { badge: true } }))));
router.get("/badges", validate({ query: pageQuery }), asyncRoute(async (req, res) => listModel(req, res, "badge", { orderBy: { createdAt: "desc" } })));
router.post("/badges", requireRoles(...adminOrManager), validate({ body: badgeSchema }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  parseBadgeRule(body.unlockRule);
  sendSuccess(req, res, await db.badge.create({ data: body }), 201);
}));
router.get("/badges/:id", validate({ params: idParam }), asyncRoute(async (req, res) => sendSuccess(req, res, await db.badge.findUniqueOrThrow({ where: { id: req.params.id } }))));
router.patch("/badges/:id", requireRoles(...adminOrManager), validate({ params: idParam, body: badgeSchema.partial().strict() }), asyncRoute(async (req, res) => {
  const body = req.validated!.body as any;
  if (body.unlockRule) parseBadgeRule(body.unlockRule);
  sendSuccess(req, res, await db.badge.update({ where: { id: req.params.id }, data: body }));
}));
router.delete("/badges/:id", requireRoles(...adminOrManager), validate({ params: idParam }), asyncRoute(async (req, res) => sendSuccess(req, res, await db.badge.update({ where: { id: req.params.id }, data: { status: BadgeStatus.INACTIVE } }))));
router.get("/employees/:id/badges", validate({ params: idParam }), asyncRoute(async (req, res) => {
  if (req.auth!.role === Role.EMPLOYEE && req.auth!.id !== req.params.id) throw new AppError(403, "FORBIDDEN", "Employees can access only their own badges.");
  sendSuccess(req, res, await db.employeeBadge.findMany({ where: { employeeId: req.params.id }, include: { badge: true } }));
}));

const rewardSchema = z.object({ name: z.string().min(1), description: z.string().optional().nullable(), imageUrl: safeUrl(true), cost: z.number().int().positive(), currency: z.nativeEnum(RewardCurrency), stock: z.number().int().nonnegative(), status: z.nativeEnum(RewardStatus).optional() }).strict();
router.get("/rewards", validate({ query: pageQuery }), asyncRoute(async (req, res) => listModel(req, res, "reward", { orderBy: { createdAt: "desc" } })));
router.post("/rewards", requireRoles(...adminOrManager), validate({ body: rewardSchema }), asyncRoute(async (req, res) => sendSuccess(req, res, await db.reward.create({ data: req.validated!.body as any }), 201)));
router.get("/rewards/:id", validate({ params: idParam }), asyncRoute(async (req, res) => sendSuccess(req, res, await db.reward.findUniqueOrThrow({ where: { id: req.params.id } }))));
router.patch("/rewards/:id", requireRoles(...adminOrManager), validate({ params: idParam, body: rewardSchema.partial().strict() }), asyncRoute(async (req, res) => sendSuccess(req, res, await db.reward.update({ where: { id: req.params.id }, data: req.validated!.body as any }))));
router.delete("/rewards/:id", requireRoles(...adminOrManager), validate({ params: idParam }), asyncRoute(async (req, res) => sendSuccess(req, res, await db.reward.update({ where: { id: req.params.id }, data: { status: RewardStatus.INACTIVE } }))));
router.post("/rewards/:id/redeem", requireRoles(Role.EMPLOYEE), validate({ params: idParam }), asyncRoute(async (req, res) => {
  const result = await db.$transaction(async (tx: any) => {
    const reward = await tx.reward.findUniqueOrThrow({ where: { id: req.params.id } });
    if (reward.status !== RewardStatus.ACTIVE) throw new AppError(400, "INVALID_STATE", "Reward is not active.");
    const balances = await employeeBalances(req.auth!.id, tx);
    const available = reward.currency === RewardCurrency.POINTS ? balances.pointsAvailable : balances.xpAvailable;
    if (available < reward.cost) throw new AppError(409, reward.currency === RewardCurrency.POINTS ? "INSUFFICIENT_POINTS" : "INSUFFICIENT_XP", "Insufficient balance for this reward.");
    const updated = await tx.reward.updateMany({ where: { id: reward.id, stock: { gt: 0 } }, data: { stock: { decrement: 1 } } });
    if (updated.count !== 1) throw new AppError(409, "OUT_OF_STOCK", "Reward is out of stock.");
    const redemption = await tx.rewardRedemption.create({ data: { employeeId: req.auth!.id, rewardId: reward.id, rewardNameSnapshot: reward.name, amountSpent: reward.cost, currencySnapshot: reward.currency } });
    await notify(req.auth!.id, NotificationType.REWARD_REDEEMED, "Reward redeemed", `Reward redeemed: ${reward.name}.`, "RewardRedemption", redemption.id, tx);
    await logActivity(req, "REWARD_REDEEMED", "RewardRedemption", redemption.id, undefined, tx);
    return { redemption, balance: await employeeBalances(req.auth!.id, tx), stock: reward.stock - 1 };
  });
  sendSuccess(req, res, result, 201);
}));
router.get("/reward-redemptions/mine", requireRoles(Role.EMPLOYEE), validate({ query: pageQuery }), asyncRoute(async (req, res) => {
  req.query.employeeId = req.auth!.id;
  return listModel(req, res, "rewardRedemption", { include: { reward: true }, orderBy: { redeemedAt: "desc" } });
}));
router.get("/reward-redemptions", requireRoles(Role.ADMIN, Role.ESG_MANAGER), validate({ query: pageQuery }), asyncRoute(async (req, res) => listModel(req, res, "rewardRedemption", { include: { employee: true, reward: true }, orderBy: { redeemedAt: "desc" } })));
router.patch("/reward-redemptions/:id/status", requireRoles(Role.ADMIN, Role.ESG_MANAGER), validate({ params: idParam, body: z.object({ status: z.enum([RedemptionStatus.FULFILLED, RedemptionStatus.CANCELLED]) }).strict() }), asyncRoute(async (req, res) => {
  const status = (req.validated!.body as any).status;
  const item = await db.$transaction(async (tx: any) => {
    const redemption = await tx.rewardRedemption.findUniqueOrThrow({ where: { id: req.params.id } });
    if (redemption.status !== RedemptionStatus.PENDING) throw new AppError(400, "INVALID_STATE", "Redemption is already terminal.");
    if (status === RedemptionStatus.CANCELLED) await tx.reward.update({ where: { id: redemption.rewardId }, data: { stock: { increment: 1 } } });
    return tx.rewardRedemption.update({ where: { id: redemption.id }, data: { status, processedById: req.auth!.id, fulfilledAt: status === RedemptionStatus.FULFILLED ? new Date() : null, cancelledAt: status === RedemptionStatus.CANCELLED ? new Date() : null } });
  });
  sendSuccess(req, res, item);
}));

router.get("/leaderboard", asyncRoute(async (req, res) => {
  const scope = String(req.query.scope ?? "employee");
  const users = await db.user.findMany({ where: { isActive: true }, include: { department: true } });
  const rows = [];
  for (const user of users) {
    const b = await employeeBalances(user.id);
    rows.push({ id: user.id, name: user.name, departmentId: user.departmentId, departmentName: user.department?.name, points: b.pointsEarned, xp: b.xpEarned, combined: b.pointsEarned + b.xpEarned });
  }
  const metric = String(req.query.metric ?? "combined");
  const ranked = rows.sort((a: any, b: any) => (b[metric] ?? 0) - (a[metric] ?? 0)).map((row, index) => ({ rank: index + 1, scope, ...row }));
  sendSuccess(req, res, ranked.slice(0, 100));
}));

router.get("/notifications", validate({ query: pageQuery }), asyncRoute(async (req, res) => {
  req.query.employeeId = undefined;
  const { page, limit, skip } = parsePagination(req.query);
  const where = { userId: req.auth!.id };
  const [items, total] = await Promise.all([db.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }), db.notification.count({ where })]);
  sendPage(req, res, items, page, limit, total);
}));
router.get("/notifications/unread-count", asyncRoute(async (req, res) => sendSuccess(req, res, { unreadCount: await db.notification.count({ where: { userId: req.auth!.id, isRead: false } }) })));
router.patch("/notifications/read-all", asyncRoute(async (req, res) => {
  const result = await db.notification.updateMany({ where: { userId: req.auth!.id, isRead: false }, data: { isRead: true, readAt: new Date() } });
  sendSuccess(req, res, { updated: result.count });
}));
router.patch("/notifications/:id/read", validate({ params: idParam }), asyncRoute(async (req, res) => {
  const notification = await db.notification.findUniqueOrThrow({ where: { id: req.params.id } });
  ownOrPrivileged(req, notification.userId);
  sendSuccess(req, res, await db.notification.update({ where: { id: notification.id }, data: { isRead: true, readAt: new Date() } }));
}));

router.get("/activity-logs", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR), validate({ query: pageQuery }), asyncRoute(async (req, res) => listModel(req, res, "activityLog", { include: { actor: true }, orderBy: { createdAt: "desc" } })));

async function computeDepartmentScore(departmentId: string, date = new Date(), req?: AppRequest, tx = db) {
  const computedFor = businessDate(date.toISOString().slice(0, 10));
  const config = (await getSettings(tx)).esg;
  const goals = await tx.environmentalGoal.findMany({ where: { departmentId, status: { in: [GoalStatus.ACTIVE, GoalStatus.ON_TRACK, GoalStatus.AT_RISK] }, startDate: { lte: computedFor } } });
  const envScores = goals.map((g: any) => decimal(g.targetCo2).lte(0) ? decimal(0) : Prisma.Decimal.min(100, decimal(g.currentCo2).div(g.targetCo2).mul(100)));
  const environmentalScore = envScores.length ? envScores.reduce((a: any, b: any) => a.plus(b), decimal(0)).div(envScores.length) : decimal(0);
  const employees = await tx.user.findMany({ where: { departmentId, isActive: true, role: Role.EMPLOYEE } });
  const yearStart = new Date(Date.UTC(computedFor.getUTCFullYear(), 0, 1));
  const activeEmployeeIds = employees.map((u: any) => u.id);
  const approved = activeEmployeeIds.length ? await tx.employeeParticipation.findMany({ where: { employeeId: { in: activeEmployeeIds }, approvalStatus: ApprovalStatus.APPROVED, completionDate: { gte: yearStart, lte: computedFor } }, distinct: ["employeeId"] }) : [];
  const socialScore = employees.length ? decimal(approved.length).div(employees.length).mul(100) : decimal(0);
  const issues = await tx.complianceIssue.findMany({ where: { departmentId } });
  const weight = (s: Severity) => s === Severity.HIGH ? 3 : s === Severity.MEDIUM ? 2 : 1;
  const totalWeight = issues.reduce((sum: number, issue: any) => sum + weight(issue.severity), 0);
  const openWeight = issues.filter((i: any) => i.status === ComplianceIssueStatus.OPEN).reduce((sum: number, issue: any) => sum + weight(issue.severity), 0);
  const governanceScore = totalWeight === 0 ? decimal(100) : decimal(100).mul(decimal(1).minus(decimal(openWeight).div(totalWeight)));
  const totalScore = environmentalScore.mul(config.environmentalWeight).plus(socialScore.mul(config.socialWeight)).plus(governanceScore.mul(config.governanceWeight)).div(100);
  const score = await tx.departmentScore.upsert({
    where: { departmentId_computedFor: { departmentId, computedFor } },
    update: { environmentalScore, socialScore, governanceScore, totalScore, hasEnvironmentalData: goals.length > 0, hasSocialData: employees.length > 0, hasGovernanceData: true, metadata: { formulaVersion: "mvp-1" } },
    create: { departmentId, computedFor, environmentalScore, socialScore, governanceScore, totalScore, hasEnvironmentalData: goals.length > 0, hasSocialData: employees.length > 0, hasGovernanceData: true, metadata: { formulaVersion: "mvp-1" } }
  });
  if (req) await logActivity(req, "SCORE_RECOMPUTED", "DepartmentScore", score.id, { departmentId }, tx);
  return score;
}

router.get("/scores/departments", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR), asyncRoute(async (req, res) => {
  const departments = await db.department.findMany({ where: { status: DepartmentStatus.ACTIVE } });
  const scores = [];
  for (const d of departments) scores.push(await computeDepartmentScore(d.id));
  sendSuccess(req, res, scores);
}));
router.get("/scores/departments/:departmentId", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR), validate({ params: departmentIdParam }), asyncRoute(async (req, res) => sendSuccess(req, res, await computeDepartmentScore(String(req.params.departmentId)))));
router.get("/scores/overall", requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR), asyncRoute(async (req, res) => sendSuccess(req, res, await overallScore())));

async function overallScore() {
  const departments = await db.department.findMany({ where: { status: DepartmentStatus.ACTIVE }, include: { users: { where: { isActive: true } } } });
  let totalEmployees = 0;
  let weighted = decimal(0);
  const scores = [];
  for (const department of departments) {
    const score = await computeDepartmentScore(department.id);
    const count = department.users.length;
    totalEmployees += count;
    weighted = weighted.plus(decimal(score.totalScore).mul(count));
    scores.push(score);
  }
  return { overallScore: totalEmployees ? weighted.div(totalEmployees).toFixed(2) : "0.00", hasData: totalEmployees > 0, departments: scores };
}

router.get("/dashboard/scores", requireRoles(...allRoles), asyncRoute(async (req, res) => sendSuccess(req, res, await overallScore())));
router.get("/dashboard/emissions-trend", requireRoles(...allRoles), asyncRoute(async (req, res) => {
  const rows = await db.carbonTransaction.findMany({ orderBy: { transactionDate: "asc" } });
  const buckets = new Map<string, Prisma.Decimal>();
  for (const row of rows) {
    const key = row.transactionDate.toISOString().slice(0, 7);
    buckets.set(key, (buckets.get(key) ?? decimal(0)).plus(row.calculatedEmission));
  }
  sendSuccess(req, res, Array.from(buckets.entries()).map(([month, emissions]) => ({ month, emissions })));
}));
router.get("/dashboard/department-ranking", requireRoles(...allRoles), asyncRoute(async (req, res) => {
  const scores = (await overallScore()).departments.sort((a: any, b: any) => decimal(b.totalScore).cmp(a.totalScore)).map((s: any, i: number) => ({ rank: i + 1, departmentId: s.departmentId, totalScore: s.totalScore }));
  sendSuccess(req, res, scores);
}));
router.get("/dashboard/recent-activity", requireRoles(...allRoles), asyncRoute(async (req, res) => sendSuccess(req, res, await db.activityLog.findMany({ take: 20, orderBy: { createdAt: "desc" }, include: { actor: true } }))));

async function reportData(module: string): Promise<any> {
  if (module === "environmental") return { carbonTransactions: await db.carbonTransaction.findMany({ take: 200 }), goals: await db.environmentalGoal.findMany({ take: 200 }) };
  if (module === "social") return { activities: await db.cSRActivity.findMany({ take: 200 }), participations: await db.employeeParticipation.findMany({ take: 200 }), diversity: await db.diversitySnapshot.findMany({ take: 200 }) };
  if (module === "governance") return { policies: await db.eSGPolicy.findMany({ take: 200 }), audits: await db.audit.findMany({ take: 200 }), complianceIssues: await db.complianceIssue.findMany({ take: 200 }) };
  return { scores: await overallScore(), environmental: await reportData("environmental"), social: await reportData("social"), governance: await reportData("governance") };
}
for (const name of ["environmental", "social", "governance", "esg-summary", "custom"]) {
  router.get(`/reports/${name}`, requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR), asyncRoute(async (req, res) => sendSuccess(req, res, await reportData(name === "esg-summary" || name === "custom" ? "summary" : name))));
  router.get(`/reports/${name}/export`, requireRoles(Role.ADMIN, Role.ESG_MANAGER, Role.AUDITOR), asyncRoute(async (req, res) => {
    const data = await reportData(name === "esg-summary" || name === "custom" ? "summary" : name);
    const flat = JSON.parse(JSON.stringify(data));
    const csv = stringify(Object.entries(flat).map(([section, value]) => ({ section, value: JSON.stringify(value) })), { header: true });
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=\"${name}.csv\"`);
    res.status(200).send(csv);
  }));
}

router.post("/admin/jobs/recompute-overdue", requireRoles(Role.ADMIN), asyncRoute(async (req, res) => {
  const today = businessDate(new Date().toISOString().slice(0, 10));
  const issues = await db.complianceIssue.findMany({ where: { status: ComplianceIssueStatus.OPEN, isOverdue: false, dueDate: { lt: today } } });
  for (const issue of issues) {
    await db.complianceIssue.update({ where: { id: issue.id }, data: { isOverdue: true } });
    await notify(issue.ownerId, NotificationType.COMPLIANCE_OVERDUE, "Compliance issue overdue", issue.description, "ComplianceIssue", issue.id);
  }
  await logActivity(req, "OVERDUE_RECOMPUTED", "AdminJob", null, { count: issues.length });
  sendSuccess(req, res, { updated: issues.length });
}));
router.post("/admin/jobs/recompute-scores", requireRoles(Role.ADMIN), asyncRoute(async (req, res) => {
  const departments = await db.department.findMany({ where: { status: DepartmentStatus.ACTIVE } });
  const scores = [];
  for (const department of departments) scores.push(await computeDepartmentScore(department.id, new Date(), req));
  sendSuccess(req, res, { updated: scores.length, scores });
}));
router.post("/admin/jobs/send-policy-reminders", requireRoles(Role.ADMIN), asyncRoute(async (req, res) => {
  const policies = await db.eSGPolicy.findMany({ where: { status: PolicyStatus.PUBLISHED } });
  const users = await db.user.findMany({ where: { isActive: true, role: Role.EMPLOYEE } });
  let created = 0;
  const todayHash = createHash("sha256").update(new Date().toISOString().slice(0, 10)).digest("hex").slice(0, 8);
  for (const policy of policies) {
    for (const user of users) {
      const ack = await db.policyAcknowledgement.findUnique({ where: { policyId_employeeId: { policyId: policy.id, employeeId: user.id } } });
      if (ack) continue;
      const existing = await db.notification.findFirst({ where: { userId: user.id, type: NotificationType.POLICY_REMINDER, entityId: policy.id, metadata: { path: ["day"], equals: todayHash } } });
      if (existing) continue;
      await db.notification.create({ data: { userId: user.id, type: NotificationType.POLICY_REMINDER, title: "Policy acknowledgement reminder", message: policy.title, entityType: "ESGPolicy", entityId: policy.id, metadata: { day: todayHash } } });
      created++;
    }
  }
  await logActivity(req, "POLICY_REMINDERS_SENT", "AdminJob", null, { created });
  sendSuccess(req, res, { created });
}));

export { router as apiRouter };
