// api/login.js
// Variáveis de ambiente necessárias (Vercel → Settings → Environment Variables):
//   ADMIN_USER   → nome de usuário do admin
//   ADMIN_PASS   → senha do admin
//   JWT_SECRET   → string longa e aleatória (ex: rode `openssl rand -hex 32` no terminal)

import { SignJWT } from "jose";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { user, pass } = req.body;

  const ADMIN_USER  = process.env.ADMIN_USER;
  const ADMIN_PASS  = process.env.ADMIN_PASS;
  const JWT_SECRET  = process.env.JWT_SECRET;

  if (!ADMIN_USER || !ADMIN_PASS || !JWT_SECRET) {
    console.error("Variáveis de ambiente ADMIN_USER, ADMIN_PASS ou JWT_SECRET não configuradas");
    return res.status(500).json({ error: "Configuração interna inválida" });
  }

  // Compara credenciais
  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    // Mesmo delay para login correto e incorreto — evita timing attack
    await new Promise((r) => setTimeout(r, 300));
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  // Gera JWT assinado com validade de 8 horas
  const secret = new TextEncoder().encode(JWT_SECRET);
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  return res.status(200).json({ token });
}
