import { beforeAll, test, expect } from "bun:test";
import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@libsql/client";
import { createRouterClient } from "@orpc/server";

// The isolated URL is set BEFORE any application module imports. No live DB or email.
const directory = mkdtempSync(join(tmpdir(), "bfi-safety-"));
process.env.DATABASE_URL = `file:${directory}/test.db`;
delete process.env.DATABASE_AUTH_TOKEN;
process.env.BETTER_AUTH_SECRET = "synthetic-test-secret-at-least-32-characters";
process.env.WEBSITE_URL = "http://localhost:4200";
process.env.APPLICATION_ID = "synthetic-test-application";
process.env.VITE_RUNABLE_AUTH_ISSUER = "https://synthetic.example.invalid";
process.env.BFI_AUTH_ENABLED = "false";
process.env.BFI_COLLECTION_ENABLED = "false";
process.env.BFI_CONTACT_ENABLED = "false";
process.env.BFI_PROJECT_ENABLED = "false";
process.env.BFI_NOTIFICATIONS_ENABLED = "false";
delete process.env.RESEND_API_KEY;
delete process.env.RESEND_DOMAIN_API_KEY;
delete process.env.BFI_EMAIL_FROM;
delete process.env.BFI_EMAIL_PUBLIC_URL;

const sql = createClient({ url: process.env.DATABASE_URL });
const { default: app, router } = await import("../src/api");
const { addCalendarMonth, purgeExpired } = await import("../src/api/services/retention");
const { adminAllowed, requireCollection } = await import("../src/api/services/collection-config");
const { projectSchema, contactSchema } = await import("../src/shared/submission-schemas");
const { site } = await import("../src/shared/site-config");
const { checkAbuse } = await import("../src/api/services/abuse-protection");
const rpc = createRouterClient(router, { context: { headers: new Headers() } });
const project = {
  name: "Exemple synthétique",
  email: "synthetic@example.invalid",
  phone: "+33 600000000",
  consent: true,
  country: "France",
  company: "",
  sector: "Innovation et technologie",
  stage: "Idée",
  amount: "50000",
  currency: "EUR",
  otherCurrency: "",
  description: "Un projet entièrement synthétique pour vérifier le fonctionnement du formulaire.",
  purpose: "Acquisition de matériel pour ce test synthétique.",
  contribution: "",
  revenue: "",
  businessPlan: "Non",
};
const contact = {
  name: project.name,
  email: project.email,
  subject: "Test synthétique",
  message: "Message synthétique sans personne réelle concernée.",
  consent: true,
};

beforeAll(async () => {
  const migrations = join(import.meta.dir, "../drizzle");
  for (const file of readdirSync(migrations).filter((file) => file.endsWith(".sql")).sort()) {
    await sql.executeMultiple(readFileSync(join(migrations, file), "utf8"));
  }
});

test("calendar-month UTC clamping keeps time and leap years", () => {
  for (const [input, output] of [
    ["2025-01-31T12:34:56.789Z", "2025-02-28T12:34:56.789Z"],
    ["2024-01-31T12:34:56.789Z", "2024-02-29T12:34:56.789Z"],
    ["2025-08-31T12:34:56.789Z", "2025-09-30T12:34:56.789Z"],
    ["2025-12-31T12:34:56.789Z", "2026-01-31T12:34:56.789Z"],
  ])
    expect(addCalendarMonth(new Date(input!)).toISOString()).toBe(output!);
});

test("allowlist requires verified identity, never claimed role", () => {
  expect(adminAllowed(null)).toBe(false);
  expect(adminAllowed({ email: site.adminEmail, emailVerified: false })).toBe(false);
  expect(site.email).toBe("contact@bfinanceinvest.com");
  expect(adminAllowed({ email: site.email, emailVerified: true })).toBe(false);
  expect(adminAllowed({ email: "other@example.invalid", emailVerified: true })).toBe(false);
  expect(adminAllowed({ email: "BFI@PROTON.ME", emailVerified: true })).toBe(true);
});

test("shared schemas reject invalid money, country, length, email and consent", () => {
  expect(projectSchema.safeParse(project).success).toBe(true);
  for (const patch of [
    { amount: "0" },
    { amount: "-10" },
    { amount: "1e9" },
    { amount: "1234567890123" },
    { country: "Hors liste" },
    { description: "court" },
    { description: "x".repeat(6001) },
    { currency: "Autre" },
    { consent: false },
    { email: "incorrect" },
  ])
    expect(projectSchema.safeParse({ ...project, ...patch }).success).toBe(false);
  expect(
    projectSchema.safeParse({ ...project, currency: "Autre", otherCurrency: "XOF" }).success,
  ).toBe(true);
  expect(contactSchema.safeParse({ ...contact, message: "x".repeat(4001) }).success).toBe(false);
  for (const patch of [{ name: "" }, { email: "incorrect" }, { subject: "" }, { message: "court" }, { consent: false }])
    expect(contactSchema.safeParse({ ...contact, ...patch }).success).toBe(false);
});

test("demo denies direct mutations and all protected admin operations", async () => {
  expect((await rpc.submissions.configuration()).demo).toBe(true);
  await expect(
    rpc.submissions.project({ data: project, requestId: crypto.randomUUID(), website: "" }),
  ).rejects.toMatchObject({ code: "FORBIDDEN" });
  await expect(
    rpc.submissions.contact({ data: contact, requestId: crypto.randomUUID(), website: "" }),
  ).rejects.toMatchObject({ code: "FORBIDDEN" });
  await expect(rpc.admin.profile()).rejects.toMatchObject({ code: "FORBIDDEN" });
  await expect(rpc.admin.list({ kind: "project", page: 0, status: "" })).rejects.toMatchObject({
    code: "FORBIDDEN",
  });
  await expect(rpc.admin.detail({ kind: "project", id: "test" })).rejects.toMatchObject({
    code: "FORBIDDEN",
  });
  await expect(
    rpc.admin.update({ kind: "project", id: "test", status: "Clôturé" }),
  ).rejects.toMatchObject({ code: "FORBIDDEN" });
  await expect(rpc.admin.retryNotification({ kind: "project", id: "test" })).rejects.toMatchObject({
    code: "FORBIDDEN",
  });
  expect((await sql.execute("SELECT count(*) n FROM project_submissions")).rows[0]!.n).toBe(0);
  expect((await sql.execute("SELECT count(*) n FROM contact_messages")).rows[0]!.n).toBe(0);
  expect((await app.request("/api/auth/get-session")).status).toBe(403);
  expect(
    (await app.request("/api/rpc/submissions/project", { method: "POST", body: "x".repeat(40001) }))
      .status,
  ).toBe(413);
});

test("synthetic real flow: heartbeat gate, idempotency, notification failure, purge", async () => {
  process.env.BFI_AUTH_ENABLED = "true";
  process.env.BFI_COLLECTION_ENABLED = "true";
  process.env.BFI_CONTACT_ENABLED = "true";
  process.env.BFI_PROJECT_ENABLED = "true";
  process.env.BFI_LEGAL_APPROVED = "true";
  process.env.BFI_RETENTION_READY = "true";
  const original = {
    legalName: site.legalName,
    address: site.address,
    publisher: site.publisher,
    hosting: site.hosting,
  };
  Object.assign(site, {
    legalName: "SYNTHETIC",
    address: "SYNTHETIC",
    publisher: "SYNTHETIC",
    hosting: "SYNTHETIC",
  });
  try {
    await expect(requireCollection()).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
    await purgeExpired();
    await expect(rpc.admin.profile()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    const now = Date.now();
    const authenticated = (token: string) =>
      createRouterClient(router, {
        context: { headers: new Headers({ Authorization: `Bearer ${token}` }) },
      });
    for (const [id, email, verified] of [
      ["wrong", "other@example.invalid", 1],
      ["unverified", site.adminEmail, 0],
    ] as const) {
      await sql.execute({
        sql: "INSERT INTO user (id,name,email,email_verified,created_at,updated_at) VALUES (?,?,?,?,?,?)",
        args: [id, "Synthetic", email, verified, now, now],
      });
      await sql.execute({
        sql: "INSERT INTO session (id,token,user_id,expires_at,created_at,updated_at) VALUES (?,?,?,?,?,?)",
        args: [id, `synthetic-${id}`, id, now + 3600000, now, now],
      });
      await expect(authenticated(`synthetic-${id}`).admin.profile()).rejects.toMatchObject({
        code: "FORBIDDEN",
      });
    }
    await sql.execute("UPDATE user SET email_verified=1 WHERE id='unverified'");
    const allowed = authenticated("synthetic-unverified");
    expect((await allowed.admin.profile()).email).toBe(site.adminEmail);
    const request = { data: project, requestId: crypto.randomUUID(), website: "" };
    const first = await rpc.submissions.project(request);
    const duplicate = await rpc.submissions.project(request);
    expect(duplicate.id).toBe(first.id);
    expect((await sql.execute("SELECT count(*) n FROM project_submissions")).rows[0]!.n).toBe(1);
    const before = await allowed.admin.detail({ kind: "project", id: first.id });
    await allowed.admin.update({ kind: "project", id: first.id, status: "Clôturé" });
    expect(
      (await allowed.admin.detail({ kind: "project", id: first.id })).expiresAt.getTime(),
    ).toBe(before.expiresAt.getTime());
    process.env.BFI_NOTIFICATIONS_ENABLED = "true"; // no API key: must fail without sending
    const received = await rpc.submissions.contact({
      data: contact,
      requestId: crypto.randomUUID(),
      website: "",
    });
    expect(received.notification).toBe("failed");
    expect((await sql.execute("SELECT count(*) n FROM contact_messages")).rows[0]!.n).toBe(1);
    const expiry = Date.now();
    for (const table of ["project_submissions", "contact_messages", "notifications"])
      await sql.execute({ sql: `UPDATE ${table} SET expires_at=?`, args: [expiry] });
    expect(await allowed.admin.list({ kind: "project", page: 0, status: "" })).toHaveLength(0);
    await expect(allowed.admin.detail({ kind: "project", id: first.id })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(
      allowed.admin.update({ kind: "project", id: first.id, status: "Nouveau" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(
      allowed.admin.retryNotification({ kind: "project", id: first.id }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(rpc.submissions.project(request)).rejects.toMatchObject({ code: "CONFLICT" });
    await purgeExpired(new Date(expiry)); // equality must delete, not only strictly older
    for (const table of ["project_submissions", "contact_messages", "notifications"])
      expect((await sql.execute(`SELECT count(*) n FROM ${table}`)).rows[0]!.n).toBe(0);
    for (let i = 0; i < 5; i++) await checkAbuse("limited@example.invalid", "");
    await expect(checkAbuse("limited@example.invalid", "")).rejects.toMatchObject({
      code: "TOO_MANY_REQUESTS",
    });
    await expect(checkAbuse("trap@example.invalid", "spam")).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  } finally {
    Object.assign(site, original);
    process.env.BFI_COLLECTION_ENABLED = "false";
    process.env.BFI_CONTACT_ENABLED = "false";
    process.env.BFI_PROJECT_ENABLED = "false";
    process.env.BFI_AUTH_ENABLED = "false";
    process.env.BFI_NOTIFICATIONS_ENABLED = "false";
  }
});

test("contact-only permission is fail-closed and never opens project intake", async () => {
  const original = { ...site };
  process.env.BFI_AUTH_ENABLED = "true";
  process.env.BFI_COLLECTION_ENABLED = "true";
  process.env.BFI_LEGAL_APPROVED = "true";
  process.env.BFI_RETENTION_READY = "true";
  delete process.env.BFI_CONTACT_ENABLED;
  delete process.env.BFI_PROJECT_ENABLED;
  Object.assign(site, { legalName: "SYNTHETIC", address: "SYNTHETIC", publisher: "SYNTHETIC", hosting: "SYNTHETIC" });
  try {
    await purgeExpired();
    expect((await rpc.submissions.configuration()).contactEnabled).toBe(false);
    await expect(rpc.submissions.contact({ data: contact, requestId: crypto.randomUUID(), website: "" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    process.env.BFI_CONTACT_ENABLED = "true";
    const config = await rpc.submissions.configuration();
    expect(config.contactEnabled).toBe(true);
    expect(config.projectEnabled).toBe(false);
    expect(config.demo).toBe(true);
    await expect(rpc.submissions.project({ data: project, requestId: crypto.randomUUID(), website: "" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect((await sql.execute("SELECT count(*) n FROM project_submissions")).rows[0]!.n).toBe(0);
    const input = { data: { ...contact, email: "contact-only@example.invalid" }, requestId: crypto.randomUUID(), website: "" };
    const result = await rpc.submissions.contact(input);
    expect((await rpc.submissions.contact(input)).id).toBe(result.id);
    expect((await sql.execute("SELECT count(*) n FROM contact_messages")).rows[0]!.n).toBe(1);
    await expect(rpc.submissions.contact({ ...input, requestId: crypto.randomUUID(), data: { ...input.data, consent: false } })).rejects.toBeDefined();
    process.env.BFI_CONTACT_ENABLED = "false";
    await expect(rpc.submissions.contact(input)).rejects.toMatchObject({ code: "FORBIDDEN" });
  } finally {
    Object.assign(site, original);
    for (const flag of ["BFI_AUTH_ENABLED", "BFI_COLLECTION_ENABLED", "BFI_CONTACT_ENABLED", "BFI_PROJECT_ENABLED", "BFI_LEGAL_APPROVED", "BFI_RETENTION_READY"]) process.env[flag] = "false";
  }
});
