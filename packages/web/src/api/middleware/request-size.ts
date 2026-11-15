import type { MiddlewareHandler } from "hono";

// Check streamed bytes, not just the declared Content-Length. Read no more than
// the configured limit before handing the buffered request to oRPC/Better Auth.
export const requestSizeLimit: MiddlewareHandler = async (c, next) => {
  const request = c.req.raw;
  if (!request.body) return next();
  const max = 40_000;
  if (Number(request.headers.get("content-length")) > max)
    return c.json({ message: "Requête trop volumineuse." }, 413);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > max) {
      await reader.cancel();
      return c.json({ message: "Requête trop volumineuse." }, 413);
    }
    chunks.push(value);
  }
  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  c.req.raw = new Request(request, { method: request.method, body });
  return next();
};
