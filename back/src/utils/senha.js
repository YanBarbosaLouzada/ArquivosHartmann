// utils/senha.js
// Nunca guardamos a senha "pura" no banco: guardamos "salt:hash" gerado pelo scrypt
// (vem junto com o Node, não precisa instalar nada).
import crypto from "node:crypto";

export function gerarHashSenha(senha) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(senha, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function conferirSenha(senha, senhaSalva) {
  // Agentes antigos, cadastrados antes do hash, ainda têm a senha pura no banco
  if (!senhaSalva.includes(":")) return senha === senhaSalva;

  const [salt, hash] = senhaSalva.split(":");
  const hashDigitado = crypto.scryptSync(senha, salt, 64);
  const hashBanco = Buffer.from(hash, "hex");
  return hashBanco.length === hashDigitado.length && crypto.timingSafeEqual(hashBanco, hashDigitado);
}
