import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { runableManagedAuth } from "@runablehq/managed-auth/server";
import { db } from "./database";
import { onVerifiedAccount, sendVerification } from "./services/notification";
import { site } from "../shared/site-config";

export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: process.env.WEBSITE_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "sqlite" }),
  trustedOrigins: [process.env.WEBSITE_URL!].filter(Boolean),
  emailAndPassword: { enabled: true, disableSignUp: true, requireEmailVerification: true },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url }) => sendVerification(user.email, url),
    afterEmailVerification: async (user) => onVerifiedAccount(user),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => (user.email.toLowerCase() === site.adminEmail ? { data: user } : false),
        after: async (user) => onVerifiedAccount(user),
      },
      update: { after: async (user) => onVerifiedAccount(user) },
    },
  },
  rateLimit: { enabled: true, window: 60, max: 10 },
  session: { expiresIn: 3600, updateAge: 900 },
  plugins: [
    ...runableManagedAuth({
      applicationId: process.env.APPLICATION_ID!,
      issuer: process.env.VITE_RUNABLE_AUTH_ISSUER!,
    }),
  ],
});
