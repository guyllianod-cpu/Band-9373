/** Dedicated simulated suite. Run ONLY this file; no auth, purge or live provider. */
import { afterAll, afterEach, beforeEach, expect, mock, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { createRouterClient, ORPCError } from "@orpc/server";
import * as schema from "../src/api/database/schema";

const temporary = mkdtempSync(join(tmpdir(), "bfi-contact-simulated-"));
const originalFetch = globalThis.fetch;
const syntheticEnv = {
  DATABASE_URL: `file:${join(temporary, "unused.sqlite")}`,
  DATABASE_AUTH_TOKEN: undefined,
  RESEND_API_KEY: "re_synthetic_send_not_a_real_key",
  RESEND_DOMAIN_API_KEY: "re_synthetic_domain_not_a_real_key",
  BETTER_AUTH_SECRET: "synthetic-test-secret-never-used-for-accounts",
  BFI_AUTH_ENABLED: "true", BFI_NOTIFICATIONS_ENABLED: "true",
  BFI_EMAIL_FROM: "BAND FINVEST <contact@bfinanceinvest.com>",
  BFI_EMAIL_PUBLIC_URL: "https://bfinanceinvest.com/",
  WEBSITE_URL: "https://bfinanceinvest.com",
};
const originalEnv = Object.fromEntries(Object.keys(syntheticEnv).map((key) => [key, process.env[key]]));
for (const [key, value] of Object.entries(syntheticEnv)) {
  if (value === undefined) delete process.env[key]; else process.env[key] = value;
}

let sqlite: Client;
let database: ReturnType<typeof drizzle<typeof schema>>;
let enabled = true;
let forceInitialMiss = false;
let fallbackReads = 0;
let transactionTail = Promise.resolve();
let unexpected: string[] = [];
type Mail = { from: string; to: string | string[]; reply_to?: string; subject: string; text: string; html: string };
const recipients = (mail: Mail) => Array.isArray(mail.to) ? mail.to : [mail.to];
let mails: { body: Mail; idempotency: string | null }[] = [];
let failRecipient = "";
let domainVerified = true;

// Test-only database injection. Every fixture has an isolated file, no user table.
// Serialized write transactions emulate SQLite's single writer, while deliberately
// stale initial reads deterministically exercise the insert-conflict branch.
const injectedDB = new Proxy({} as typeof database, {
  get(_target, property) {
    if (property === "select") return (fields?: unknown) => {
      if (forceInitialMiss && fields && "data" in (fields as object)) {
        return { from: () => ({ where: () => ({ limit: async () => [] }) }) };
      }
      return database.select(fields as never);
    };
    if (property === "transaction") return async (callback: (tx: unknown) => Promise<unknown>) => {
      const previous = transactionTail;
      let release!: () => void;
      transactionTail = new Promise<void>((resolve) => { release = resolve; });
      await previous;
      try {
        return await database.transaction(async (tx) => callback(new Proxy(tx, {
          get(target, key) {
            if (key === "select") return (...args: unknown[]) => {
              fallbackReads++;
              return (target.select as Function)(...args);
            };
            const value = Reflect.get(target, key);
            return typeof value === "function" ? value.bind(target) : value;
          },
        })));
      } finally { release(); }
    };
    const value = Reflect.get(database, property);
    return typeof value === "function" ? value.bind(database) : value;
  },
});
mock.module("../src/api/database", () => ({ db: injectedDB }));
mock.module("../src/api/services/collection-config", () => ({
  authEnabled: () => false,
  submissionEnabled: (kind: string) => kind === "contact" && enabled,
  requireCollection: async (kind: string) => {
    if (kind !== "contact" || !enabled) throw new ORPCError("FORBIDDEN", { message: "Réception fermée." });
  },
}));

// No passthrough anywhere: even an unrecognized URL fails and is counted because
// the SDK may catch a thrown fetch error. Authorization must be synthetic.
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const request = new Request(input, init);
  const url = new URL(request.url);
  const authorization = request.headers.get("authorization");
  if (url.origin === "https://api.resend.com" && url.pathname === "/domains" &&
      request.method === "GET" && authorization === `Bearer ${syntheticEnv.RESEND_DOMAIN_API_KEY}`) {
    return Response.json({ data: [{ id: "synthetic-domain", name: "bfinanceinvest.com",
      status: domainVerified ? "verified" : "pending", capabilities: { sending: "enabled" } }], has_more: false });
  }
  if (url.origin === "https://api.resend.com" && url.pathname === "/emails" &&
      request.method === "POST" && authorization === `Bearer ${syntheticEnv.RESEND_API_KEY}`) {
    const body = await request.json() as Mail;
    mails.push({ body, idempotency: request.headers.get("idempotency-key") });
    return !!failRecipient && recipients(body).includes(failRecipient)
      ? Response.json({ name: "validation_error", message: "Simulated refusal" }, { status: 422 })
      : Response.json({ id: `synthetic-provider-${mails.length}` });
  }
  unexpected.push(`${request.method} ${url.origin}${url.pathname}`);
  throw new Error("Unexpected network attempt blocked");
}) as typeof fetch;

const { submissions } = await import("../src/api/routes/submissions");
const { notifySubmission, sendContactReceipt } = await import("../src/api/services/notification");
const client = createRouterClient({ submissions }, { context: { headers: new Headers() } });
let fixture = 0;
beforeEach(async () => {
  sqlite = createClient({ url: `file:${join(temporary, `fixture-${++fixture}.sqlite`)}` });
  database = drizzle(sqlite, { schema, logger: { logQuery(query) {
    if (/\bdelete\b|\b(?:user|session|account|verification)\b/i.test(query)) {
      unexpected.push("Forbidden account or purge SQL");
      throw new Error("Account operations and purge forbidden");
    }
  } } });
  await sqlite.executeMultiple(`
    CREATE TABLE contact_messages (id TEXT PRIMARY KEY, request_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL, email TEXT NOT NULL, subject TEXT NOT NULL, data TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Nouveau', notice_version TEXT NOT NULL,
      created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL);
    CREATE TABLE notifications (id TEXT PRIMARY KEY, kind TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'pending', attempts INTEGER NOT NULL DEFAULT 0, expires_at INTEGER NOT NULL);
    CREATE TABLE abuse_buckets (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at INTEGER NOT NULL);
    CREATE TABLE email_deliveries (id TEXT PRIMARY KEY, user_id TEXT, kind TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'pending', attempts INTEGER NOT NULL DEFAULT 0, provider_id TEXT,
      created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, lease_until INTEGER NOT NULL, expires_at INTEGER);
  `);
  enabled = true; forceInitialMiss = false; fallbackReads = 0;
  unexpected = []; mails = []; failRecipient = ""; domainVerified = true;
  transactionTail = Promise.resolve();
});
afterEach(() => { sqlite.close(); expect(unexpected).toEqual([]); });
afterAll(() => {
  globalThis.fetch = originalFetch;
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  mock.restore();
  // Remove only this suite's temporary files; never delete application data.
  rmSync(temporary, { recursive: true, force: true });
});
const input = () => ({ requestId: crypto.randomUUID(), website: "", data: {
  name: "Visiteur synthétique", email: "visitor@example.invalid", subject: "Question synthétique",
  message: "Message synthétique sans personne réelle concernée.", consent: true,
} });
async function counts() {
  return { contacts: (await database.select().from(schema.contactMessages)).length,
    notifications: (await database.select().from(schema.notifications)).length,
    deliveries: (await database.select().from(schema.emailDeliveries)).length };
}

test("closed contact and project permissions: no persistence or provider", async () => {
  enabled = false;
  expect(await client.submissions.configuration()).toMatchObject({ contactEnabled: false, projectEnabled: false });
  await expect(client.submissions.contact(input())).rejects.toMatchObject({ code: "FORBIDDEN" });
  expect(await counts()).toEqual({ contacts: 0, notifications: 0, deliveries: 0 });
  expect(mails).toHaveLength(0);
});
test("required fields, consent and honeypot rejected before persistence", async () => {
  for (const patch of [{ name: "" }, { email: "invalid" }, { subject: "" }, { message: "short" }, { consent: false }]) {
    const request = input(); Object.assign(request.data, patch);
    await expect(client.submissions.contact(request)).rejects.toMatchObject({ code: "BAD_REQUEST" });
  }
  await expect(client.submissions.contact({ ...input(), website: "bot.invalid" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  expect(await counts()).toEqual({ contacts: 0, notifications: 0, deliveries: 0 });
  expect(mails).toHaveLength(0);
});
test("identical validated retry: one contact, two unique provider events and exact recipients", async () => {
  const request = input(); request.data.name = "  Visiteur synthétique  ";
  const first = await client.submissions.contact(request);
  const repeat = await client.submissions.contact({ ...request, data: { ...request.data, name: request.data.name.trim() } });
  expect(first).toMatchObject({ notification: "sent", receipt: "sent" });
  expect(repeat).toEqual({ id: first.id, notification: "already-recorded" });
  expect(await counts()).toEqual({ contacts: 1, notifications: 1, deliveries: 2 });
  expect(mails).toHaveLength(2);
  expect(new Set(mails.map((mail) => mail.idempotency)).size).toBe(2);
  for (const mail of mails) {
    expect(mail.body.from).toBe(syntheticEnv.BFI_EMAIL_FROM);
    expect(mail.idempotency).toMatch(/^bandfinvest-[a-f0-9]{64}$/);
  }
  expect(recipients(mails[0].body)).toEqual(["contact@bfinanceinvest.com"]);
  expect(mails[0].body.reply_to).toBe(request.data.email);
  expect(mails[0].body.text).toContain(request.data.message);
  expect(recipients(mails[1].body)).toEqual([request.data.email]);
  expect(mails[1].body.text).toContain(first.id);
  expect(mails[1].body.text + mails[1].body.html).not.toContain(request.data.message);
  expect(mails[1].body.reply_to).toBeUndefined();
});
for (const [field, value] of Object.entries({ name: "Autre visiteur", email: "other@example.invalid",
  subject: "Autre objet", message: "Autre message synthétique différent du premier." })) {
  test(`same reference with different ${field}: generic conflict, no additional email`, async () => {
    const request = input(); await client.submissions.contact(request);
    let error: unknown;
    try { await client.submissions.contact({ ...request, data: { ...request.data, [field]: value } }); }
    catch (caught) { error = caught; }
    expect(error).toBeInstanceOf(ORPCError);
    expect(error).toMatchObject({ code: "CONFLICT" });
    const serialized = JSON.stringify(error);
    for (const sensitive of [request.data.name, request.data.email, request.data.subject, request.data.message]) {
      expect(serialized).not.toContain(sensitive);
    }
    expect(await counts()).toEqual({ contacts: 1, notifications: 1, deliveries: 2 });
    expect(mails).toHaveLength(2);
  });
}
test("concurrent identical requests with stale initial reads: insert-conflict returns existing ID", async () => {
  forceInitialMiss = true;
  const request = input();
  const results = await Promise.all([client.submissions.contact(request), client.submissions.contact(request)]);
  expect(results[0].id).toBe(results[1].id);
  expect(results.map((result) => result.notification).sort()).toEqual(["already-recorded", "sent"]);
  expect(fallbackReads).toBe(1);
  expect(await counts()).toEqual({ contacts: 1, notifications: 1, deliveries: 2 });
  expect(mails).toHaveLength(2);
});
test("concurrent different requests with stale initial reads: loser conflicts without email", async () => {
  forceInitialMiss = true;
  const request = input();
  const results = await Promise.allSettled([client.submissions.contact(request),
    client.submissions.contact({ ...request, data: { ...request.data, subject: "Objet concurrent différent" } })]);
  expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
  const rejected = results.find((result) => result.status === "rejected") as PromiseRejectedResult;
  expect(rejected.reason).toMatchObject({ code: "CONFLICT" });
  expect(JSON.stringify(rejected.reason)).not.toContain(request.data.email);
  expect(fallbackReads).toBe(1);
  expect(await counts()).toEqual({ contacts: 1, notifications: 1, deliveries: 2 });
  expect(mails).toHaveLength(2);
});
for (const recipient of ["contact@bfinanceinvest.com", "visitor@example.invalid"]) {
  test(`independent provider failure for ${recipient}: saved contact and accepted event remain deduplicated`, async () => {
    failRecipient = recipient;
    const request = input(); const result = await client.submissions.contact(request);
    expect(result.notification).toBe(recipient === "contact@bfinanceinvest.com" ? "failed" : "sent");
    expect("receipt" in result && result.receipt).toBe(recipient === request.data.email ? "failed" : "sent");
    expect(await client.submissions.contact(request)).toMatchObject({ id: result.id, notification: "already-recorded" });
    expect(mails).toHaveLength(2);
    const originalKeys = mails.map((mail) => mail.idempotency);
    failRecipient = "";
    expect(await notifySubmission(result.id)).toBe("sent");
    expect(await sendContactReceipt(result.id)).toBe("sent");
    expect(mails).toHaveLength(3);
    expect(mails[2].idempotency).toBe(originalKeys[recipient === request.data.email ? 1 : 0]);
    expect(await counts()).toEqual({ contacts: 1, notifications: 1, deliveries: 2 });
  });
}
test("unverified mock domain: persisted contact but zero send requests", async () => {
  domainVerified = false;
  expect(await client.submissions.contact(input())).toMatchObject({ notification: "failed", receipt: "failed" });
  expect(await counts()).toEqual({ contacts: 1, notifications: 1, deliveries: 2 });
  expect(mails).toHaveLength(0);
});