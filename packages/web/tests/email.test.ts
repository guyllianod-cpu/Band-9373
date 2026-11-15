import { afterAll, beforeAll, beforeEach, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@libsql/client";
import { createRouterClient } from "@orpc/server";

// Run as a separate Bun process from safety.test.ts: both isolate their database.
const directory = mkdtempSync(join(tmpdir(), "bandfinvest-email-"));
process.env.DATABASE_URL = `file:${directory}/test.db`;
delete process.env.DATABASE_AUTH_TOKEN;
process.env.BETTER_AUTH_SECRET = "synthetic-email-test-secret-at-least-32-characters";
process.env.APPLICATION_ID = "synthetic-email-test-application";
process.env.VITE_RUNABLE_AUTH_ISSUER = "https://synthetic.example.invalid";
process.env.WEBSITE_URL = "https://bfinanceinvest.com";
process.env.BFI_EMAIL_PUBLIC_URL = "https://bfinanceinvest.com";
process.env.RESEND_API_KEY = "synthetic-send-key";
process.env.RESEND_DOMAIN_API_KEY = "synthetic-domain-key";
process.env.BFI_EMAIL_FROM = "BAND FINVEST <contact@bfinanceinvest.com>";
process.env.BFI_NOTIFICATIONS_ENABLED = "true";
process.env.BFI_AUTH_ENABLED = "true";
process.env.BFI_COLLECTION_ENABLED = "false";
process.env.BFI_CONTACT_ENABLED = "false";
process.env.BFI_PROJECT_ENABLED = "false";
const sql = createClient({ url: process.env.DATABASE_URL });
const { default: app, router } = await import("../src/api");
const rpc = createRouterClient(router, { context: { headers: new Headers() } });
const { auth } = await import("../src/api/auth");
const { sendVerification, sendWelcome, notifySubmission, onVerifiedAccount, sendContactReceipt } = await import("../src/api/services/notification");
const { emailEventID, deliverEmail } = await import("../src/api/services/email-delivery");
const { assertEmailDomain, verificationLink, emailPublicURL } = await import("../src/api/services/email-policy");
const { verificationEmail, submissionEmail } = await import("../src/api/services/email-templates");
const { purgeExpired } = await import("../src/api/services/retention");
const { site } = await import("../src/shared/site-config");

type Sent = { from: string; to: string | string[]; reply_to?: string; subject: string; text: string; html: string };
let sent: Sent[] = [];
let requests: string[] = [];
let sendMode = "success";
let domainMode = "verified";
const realFetch = globalThis.fetch;
const mockFetch = async (input: string | URL | Request, init?: RequestInit) => {
  const url = String(input);
  requests.push(url);
  if (!url.startsWith("https://api.resend.com/")) throw new Error("Network forbidden in email tests");
  const headers = new Headers(init?.headers);
  if (url.includes("/domains")) {
    expect(headers.get("Authorization")).toBe("Bearer synthetic-domain-key");
    if (domainMode === "restricted") return Response.json({ name: "restricted_api_key", message: "Restricted" }, { status: 401 });
    const domain = { id: "domain-synthetic", name: "bfinanceinvest.com", status: domainMode,
      capabilities: { sending: domainMode === "sending-disabled" ? "disabled" : "enabled", receiving: "disabled" } };
    if (url.includes("/domains/domain-synthetic")) return Response.json(domain);
    if (domainMode === "absent") return Response.json({ data: [], has_more: false });
    return Response.json({ data: [domain], has_more: false });
  }
  if (url.endsWith("/emails")) {
    expect(headers.get("Authorization")).toBe("Bearer synthetic-send-key");
    expect(headers.get("idempotency-key")).toMatch(/^bandfinvest-[a-f0-9]{64}$/);
    sent.push(JSON.parse(String(init?.body)));
    if (sendMode === "failure") return Response.json({ name: "validation_error", message: "Synthetic rejection" }, { status: 422 });
    if (sendMode === "timeout") throw new Error("Synthetic timeout");
    return Response.json({ id: `synthetic-message-${sent.length}` });
  }
  throw new Error("Unexpected provider endpoint");
};

beforeAll(async () => {
  globalThis.fetch = mockFetch as typeof fetch;
  const migrations = join(import.meta.dir, "../drizzle");
  for (const file of readdirSync(migrations).filter((file) => file.endsWith(".sql")).sort()) {
    await sql.executeMultiple(readFileSync(join(migrations, file), "utf8"));
  }
  await sql.execute("PRAGMA foreign_keys=ON");
});
beforeEach(async () => {
  sent = []; requests = []; sendMode = "success"; domainMode = "verified";
  process.env.BFI_AUTH_ENABLED = "true";
  process.env.BFI_NOTIFICATIONS_ENABLED = "true";
  process.env.BFI_COLLECTION_ENABLED = "false";
process.env.BFI_CONTACT_ENABLED = "false";
process.env.BFI_PROJECT_ENABLED = "false";
  process.env.BFI_LEGAL_APPROVED = "false";
  process.env.BFI_RETENTION_READY = "false";
  process.env.WEBSITE_URL = "https://bfinanceinvest.com";
  Object.assign(site, { legalName: "", address: "", publisher: "", hosting: "" });
  process.env.BFI_EMAIL_PUBLIC_URL = "https://bfinanceinvest.com";
  process.env.BFI_EMAIL_FROM = "BAND FINVEST <contact@bfinanceinvest.com>";
  for (const table of ["email_deliveries", "notifications", "contact_messages", "abuse_buckets", "maintenance", "session", "account", "verification", "user"])
    await sql.execute(`DELETE FROM ${table}`);
});
afterAll(() => { globalThis.fetch = realFetch; sql.close(); });

async function createUser(id = "synthetic-admin", verified = true, email = site.adminEmail) {
  const now = Date.now();
  await sql.execute({
    sql: "INSERT INTO user (id,name,email,email_verified,created_at,updated_at) VALUES (?,?,?,?,?,?)",
    args: [id, "Synthetic", email, verified ? 1 : 0, now, now],
  });
  return id;
}

test("demo blocks auth, welcome and provider calls even with secrets present", async () => {
  process.env.BFI_AUTH_ENABLED = "false";
  const id = await createUser();
  expect(await sendWelcome(id)).toBe("disabled");
  expect((await app.request("/api/auth/get-session")).status).toBe(403);
  await expect(sendVerification(site.adminEmail, "https://bfinanceinvest.com/api/auth/verify-email?token=fake")).rejects.toThrow();
  expect(requests).toHaveLength(0);
  expect((await sql.execute("SELECT count(*) n FROM email_deliveries")).rows[0]!.n).toBe(0);
});

test("domain verification fails closed on permissions, status, missing domain and sending capability", async () => {
  for (const mode of ["restricted", "pending", "absent", "sending-disabled", "partially_verified"]) {
    domainMode = mode;
    await expect(assertEmailDomain()).rejects.toThrow();
  }
  const id = await createUser();
  domainMode = "pending";
  expect(await sendWelcome(id)).toBe("failed");
  expect(sent).toHaveLength(0);
  const ledger = (await sql.execute("SELECT attempts,state FROM email_deliveries")).rows[0]!;
  expect(ledger.attempts).toBe(0);
  expect(ledger.state).toBe("failed");
  domainMode = "verified";
  expect(await sendWelcome(id)).toBe("sent");
  expect(sent).toHaveLength(1);
});

test("fixed sender, confirmed public URL and verification callback restrictions", async () => {
  for (const value of ["", "http://bfinanceinvest.com", "https://evil.example", "https://bfinanceinvest.com/path", "https://www.bfinanceinvest.com", "https://bandfinvest.com", "https://bfinanceinvest.com/?x=1", "https://bfinanceinvest.com/#x"]) {
    process.env.BFI_EMAIL_PUBLIC_URL = value;
    expect(() => emailPublicURL()).toThrow();
  }
  process.env.BFI_EMAIL_PUBLIC_URL = "https://bfinanceinvest.com/";
  expect(emailPublicURL().href).toBe("https://bfinanceinvest.com/");
  process.env.WEBSITE_URL = "https://different.example";
  expect(() => emailPublicURL()).toThrow();
  process.env.WEBSITE_URL = "https://bfinanceinvest.com";
  process.env.BFI_EMAIL_PUBLIC_URL = "https://bfinanceinvest.com";
  for (const value of ["https://evil.example/api/auth/verify-email?token=x",
    "https://bfinanceinvest.com/anything?token=x", "https://bfinanceinvest.com/api/auth/verify-email",
    "https://bfinanceinvest.com/api/auth/verify-email?token=x&callbackURL=https://evil.example"]) {
    expect(() => verificationLink(value)).toThrow();
  }
  process.env.BFI_EMAIL_FROM = "Other <other@example.com>";
  expect(await sendWelcome(await createUser())).toBe("failed");
  expect(sent).toHaveLength(0);
  expect(requests).toHaveLength(0);
});

test("welcome only goes to verified allowed account and is durably deduplicated", async () => {
  expect(await sendWelcome(await createUser("wrong", true, "other@example.invalid"))).toBe("disabled");
  const id = await createUser("admin", false);
  expect(await sendWelcome(id)).toBe("disabled");
  await sql.execute("UPDATE user SET email_verified=1 WHERE id='admin'");
  const results = await Promise.all([sendWelcome(id), sendWelcome(id)]);
  expect(results).toContain("sent");
  expect(await sendWelcome(id)).toBe("sent");
  await onVerifiedAccount({ id, emailVerified: true });
  expect(sent).toHaveLength(1);
  expect(sent[0]!.from).toBe("BAND FINVEST <contact@bfinanceinvest.com>");
  expect(sent[0]!.to).toBe(site.adminEmail);
  expect(sent[0]!.subject).toContain("bienvenue");
  const ledger = (await sql.execute("SELECT state,provider_id,expires_at FROM email_deliveries")).rows[0]!;
  expect(ledger.state).toBe("sent");
  expect(ledger.provider_id).toBeTruthy();
  expect(ledger.expires_at).toBeNull();
});

test("real Better Auth confirmation hook sends welcome after verification, never before", async () => {
  await createUser("auth-admin", false);
  await auth.api.sendVerificationEmail({ body: { email: site.adminEmail, callbackURL: "https://bfinanceinvest.com/administration" } });
  expect(sent).toHaveLength(1);
  expect(sent[0]!.subject).toContain("confirmez");
  const link = sent[0]!.text.match(/https:\/\/bfinanceinvest\.com\/api\/auth\/verify-email[^\s]+/)![0];
  const response = await app.request(link);
  expect([200, 302]).toContain(response.status);
  expect((await sql.execute("SELECT email_verified FROM user WHERE id='auth-admin'")).rows[0]!.email_verified).toBe(1);
  expect(sent).toHaveLength(2);
  expect(sent[1]!.subject).toContain("bienvenue");
  await app.request(link);
  expect(sent).toHaveLength(2);
  expect((await app.request("https://bfinanceinvest.com/api/auth/sign-up/email", { method: "POST",
    headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Other", email: "other@example.invalid", password: "synthetic-password" }) })).status).not.toBe(200);
});

test("welcome failure does not invalidate successful Better Auth verification", async () => {
  await createUser("auth-admin", false);
  await auth.api.sendVerificationEmail({ body: { email: site.adminEmail, callbackURL: "https://bfinanceinvest.com/administration" } });
  const link = sent[0]!.text.match(/https:\/\/bfinanceinvest\.com\/api\/auth\/verify-email[^\s]+/)![0];
  sendMode = "failure";
  const response = await app.request(link);
  expect([200, 302]).toContain(response.status);
  expect((await sql.execute("SELECT email_verified FROM user WHERE id='auth-admin'")).rows[0]!.email_verified).toBe(1);
  expect((await sql.execute("SELECT state FROM email_deliveries WHERE kind='welcome'")).rows[0]!.state).toBe("failed");
});

test("submission notification is minimal, deduplicated and does not send expired records", async () => {
  await sql.execute({ sql: "INSERT INTO notifications (id,kind,state,attempts,expires_at) VALUES (?,?,?,?,?)",
    args: ["synthetic-reference", "project", "pending", 0, Date.now() + 3600_000] });
  expect(await notifySubmission("synthetic-reference")).toBe("sent");
  expect(await notifySubmission("synthetic-reference")).toBe("sent");
  expect(sent).toHaveLength(1);
  expect(sent[0]!.text).toContain("synthetic-reference");
  expect(sent[0]!.text).not.toContain("synthetic@example.invalid");
  expect(sent[0]!.html).toContain("https://bfinanceinvest.com/administration");
  await sql.execute("UPDATE notifications SET expires_at=0");
  expect(await notifySubmission("synthetic-reference")).toBe("disabled");
  expect(sent).toHaveLength(1);
});

test("provider errors and unknown results remain retryable within 23h, not afterwards", async () => {
  const id = await createUser();
  sendMode = "failure";
  expect(await sendWelcome(id)).toBe("failed");
  expect((await sql.execute("SELECT state FROM email_deliveries")).rows[0]!.state).toBe("failed");
  sendMode = "success";
  expect(await sendWelcome(id)).toBe("sent");
  expect(sent).toHaveLength(2);
  await sql.execute("DELETE FROM email_deliveries");
  sendMode = "timeout";
  expect(await sendWelcome(id)).toBe("failed");
  await sql.execute({ sql: "UPDATE email_deliveries SET created_at=?", args: [Date.now() - 25 * 3600_000] });
  sendMode = "success";
  expect(await sendWelcome(id)).toBe("failed");
  expect(sent).toHaveLength(3);
  expect(emailEventID(`welcome:${id}`)).toMatch(/^[a-f0-9]{64}$/);
});

test("templates escape input; expired verification receipts purge, welcome receipt follows account", async () => {
  expect(verificationEmail('https://bfinanceinvest.com/?q="<script>').html).toContain("&quot;&lt;script&gt;");
  expect(submissionEmail("<img onerror=x>", "contact", "https://bfinanceinvest.com/administration").html).not.toContain("<img onerror");
  const id = await createUser();
  await sendWelcome(id);
  await sendVerification(site.adminEmail, "https://bfinanceinvest.com/api/auth/verify-email?token=synthetic-token");
  const stored = JSON.stringify((await sql.execute("SELECT * FROM email_deliveries")).rows);
  expect(stored).not.toContain("synthetic-token");
  expect(stored).not.toContain(site.adminEmail);
  await sql.execute("UPDATE email_deliveries SET expires_at=0 WHERE kind='verification'");
  await purgeExpired();
  expect((await sql.execute("SELECT count(*) n FROM email_deliveries")).rows[0]!.n).toBe(1);
  await sql.execute({ sql: "DELETE FROM user WHERE id=?", args: [id] });
  expect((await sql.execute("SELECT count(*) n FROM email_deliveries")).rows[0]!.n).toBe(0);
});

const contactData = {
  name: "Visiteur synthétique", email: "visitor@example.invalid", subject: "Demande synthétique",
  message: 'Message synthétique de test <img onerror="x"> sans personne réelle.', consent: true,
};

async function enableSyntheticCollection() {
  process.env.BFI_CONTACT_ENABLED = "true";
  process.env.BFI_COLLECTION_ENABLED = "true";
  process.env.BFI_LEGAL_APPROVED = "true";
  process.env.BFI_RETENTION_READY = "true";
  Object.assign(site, { legalName: "SYNTHETIC", address: "SYNTHETIC", publisher: "SYNTHETIC", hosting: "SYNTHETIC" });
  await purgeExpired();
}

async function createContact(id = "BFI-C-synthetic") {
  const now = Date.now();
  await sql.execute({
    sql: "INSERT INTO contact_messages (id,request_id,name,email,subject,data,notice_version,created_at,expires_at) VALUES (?,?,?,?,?,?,?,?,?)",
    args: [id, crypto.randomUUID(), contactData.name, contactData.email, contactData.subject,
      JSON.stringify(contactData), "synthetic", now, now + 3600_000],
  });
  return id;
}

test("contact RPC sends internal message to official inbox and minimal receipt to persisted visitor; duplicates send nothing", async () => {
  await enableSyntheticCollection();
  const request = { data: contactData, requestId: crypto.randomUUID(), website: "" };
  const first = await rpc.submissions.contact(request);
  expect(first.notification).toBe("sent");
  expect("receipt" in first && first.receipt).toBe("sent");
  expect(sent).toHaveLength(2);
  expect(sent[0]!.to).toBe("contact@bfinanceinvest.com");
  expect(sent[0]!.reply_to).toBe(contactData.email);
  expect(sent[0]!.text).toContain(contactData.message);
  expect(sent[0]!.html).not.toContain('<img onerror="x">');
  expect(sent[1]!.to).toBe(contactData.email);
  expect(sent[1]!.from).toBe("BAND FINVEST <contact@bfinanceinvest.com>");
  expect(sent[1]!.text).toContain(first.id);
  expect(sent[1]!.text).not.toContain(contactData.message);
  expect(sent[1]!.text).toContain("ni un engagement de financement");
  expect((await rpc.submissions.contact(request)).id).toBe(first.id);
  expect(await sendContactReceipt(first.id)).toBe("sent");
  expect(sent).toHaveLength(2);
  expect((await sql.execute("SELECT count(*) n FROM contact_messages")).rows[0]!.n).toBe(1);
  await expect(rpc.admin.retryNotification({ kind: "contact", id: first.id })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  const adminId = await createUser("retry-admin");
  const now = Date.now();
  await sql.execute({
    sql: "INSERT INTO session (id,token,user_id,expires_at,created_at,updated_at) VALUES (?,?,?,?,?,?)",
    args: [adminId, "synthetic-retry-token", adminId, now + 3600_000, now, now],
  });
  const allowed = createRouterClient(router, { context: { headers: new Headers({ Authorization: "Bearer synthetic-retry-token" }) } });
  const retried = await allowed.admin.retryNotification({ kind: "contact", id: first.id });
  expect(retried.state).toBe("sent");
  expect(retried.receipt).toBe("sent");
  expect(sent).toHaveLength(2);
  // Moving business notifications must never grant account/admin rights.
  expect(await sendWelcome(await createUser("business", true, site.email))).toBe("disabled");
  await expect(sendVerification(site.email, "https://bfinanceinvest.com/api/auth/verify-email?token=x")).rejects.toThrow();
});

test("receipt refuses demo, missing legal/retention/heartbeat, nonexistent or expired contacts", async () => {
  const id = await createContact();
  expect(await sendContactReceipt(id)).toBe("disabled");
  await enableSyntheticCollection();
  for (const flag of ["BFI_AUTH_ENABLED", "BFI_NOTIFICATIONS_ENABLED", "BFI_COLLECTION_ENABLED", "BFI_CONTACT_ENABLED", "BFI_LEGAL_APPROVED", "BFI_RETENTION_READY"]) {
    process.env[flag] = "false";
    expect(await sendContactReceipt(id)).toBe("disabled");
    process.env[flag] = "true";
  }
  site.legalName = "";
  expect(await sendContactReceipt(id)).toBe("disabled");
  site.legalName = "SYNTHETIC";
  await sql.execute("UPDATE maintenance SET completed_at=0");
  expect(await sendContactReceipt(id)).toBe("disabled");
  await purgeExpired();
  expect(await sendContactReceipt("nonexistent")).toBe("disabled");
  await sql.execute("UPDATE contact_messages SET expires_at=0");
  expect(await sendContactReceipt(id)).toBe("disabled");
  expect(sent).toHaveLength(0);
  expect(requests).toHaveLength(0);
});

test("receipt has fixed persisted recipient/body, independent idempotency and no personal data in ledger", async () => {
  await enableSyntheticCollection();
  const id = await createContact();
  const malicious = { kind: "contact-receipt", contactId: id, to: "attacker@example.invalid", content: { subject: "spam", text: "spam", html: "spam" } } as Parameters<typeof deliverEmail>[0];
  const results = await Promise.all([deliverEmail(malicious), sendContactReceipt(id)]);
  expect(results).toContain("sent");
  expect(sent).toHaveLength(1);
  expect(sent[0]!.to).toBe(contactData.email);
  expect(sent[0]!.subject).not.toBe("spam");
  const ledger = JSON.stringify((await sql.execute("SELECT * FROM email_deliveries")).rows);
  expect(ledger).not.toContain(contactData.email);
  expect(ledger).not.toContain(contactData.message);
  expect(ledger).toContain("contact-receipt");
  await sql.execute("UPDATE contact_messages SET expires_at=0");
  await sql.execute("UPDATE email_deliveries SET expires_at=0");
  await purgeExpired();
  expect((await sql.execute("SELECT count(*) n FROM email_deliveries")).rows[0]!.n).toBe(0);
});

test("contact/receipt domain failures block sends; receipt failure does not lose saved message", async () => {
  await enableSyntheticCollection();
  domainMode = "pending";
  const first = await rpc.submissions.contact({ data: contactData, requestId: crypto.randomUUID(), website: "" });
  expect(first.notification).toBe("failed");
  expect("receipt" in first && first.receipt).toBe("failed");
  expect(sent).toHaveLength(0);
  expect((await sql.execute("SELECT count(*) n FROM contact_messages")).rows[0]!.n).toBe(1);
  domainMode = "verified";
  sendMode = "failure";
  expect(await sendContactReceipt(first.id)).toBe("failed");
  sendMode = "success";
  expect(await sendContactReceipt(first.id)).toBe("sent");
  expect(await sendContactReceipt(first.id)).toBe("sent");
  expect(sent).toHaveLength(2);
  expect((await sql.execute("SELECT count(*) n FROM contact_messages")).rows[0]!.n).toBe(1);
});