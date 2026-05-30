// api/_verifyToken.js
// Utilitário interno — não é uma rota, é importado pelas outras API routes
// Uso: const ok = await verifyAdmin(req); if (!ok) return res.status(401)...

import { jwtVerify } from "jose";

export async function verifyAdmin(req) {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) return false;

  // Aceita token no header Authorization: Bearer <token>
  const auth = req.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) return false;

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.role === "admin";
  } catch {
    // Token inválido, expirado ou adulterado
    return false;
  }
}
