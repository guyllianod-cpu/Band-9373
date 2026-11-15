import { auth } from "../auth";
import { authEnabled } from "./collection-config";
export async function handleAuth(request: Request) {
  if (!authEnabled())
    return Response.json(
      { message: "Authentification réelle désactivée en mode démonstration." },
      { status: 403 },
    );
  return auth.handler(request);
}
