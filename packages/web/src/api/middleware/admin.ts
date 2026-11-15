import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { auth } from "../auth";
import { adminAllowed, authEnabled } from "../services/collection-config";

export const adminProcedure = base.use(async ({ context, next }) => {
  if (!authEnabled())
    throw new ORPCError("FORBIDDEN", {
      message: "Administration réelle désactivée en démonstration.",
    });
  const session = await auth.api.getSession({ headers: context.headers });
  if (!session) throw new ORPCError("UNAUTHORIZED");
  if (!adminAllowed(session.user)) throw new ORPCError("FORBIDDEN");
  return next({ context: { user: session.user } });
});
