// ---------------------------------------------------------------------------
// Funções que conversam com o Backend-RPG (rotas /agentes).
// O Vite redireciona /api -> http://localhost:3000 (ver vite.config.js).
// ---------------------------------------------------------------------------

const BASE_URL = "/api/agentes";

async function request(url, options = {}) {
  const resposta = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  // DELETE devolve 204 sem corpo
  if (resposta.status === 204) return null;

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new Error(dados?.erro || dados?.error || `Erro ${resposta.status}`);
  }
  return dados;
}

// GET /agentes  (ou /agentes?nome=...)
export function listarAgentes(nome) {
  const query = nome ? `?nome=${encodeURIComponent(nome)}` : "";
  return request(`${BASE_URL}${query}`);
}

// GET /agentes/:id
export function buscarAgente(id) {
  return request(`${BASE_URL}/${id}`);
}

// POST /agentes
export function criarAgente(agente) {
  return request(BASE_URL, {
    method: "POST",
    body: JSON.stringify(agente),
  });
}

// PUT /agentes/:id
export function atualizarAgente(id, agente) {
  return request(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(agente),
  });
}

// DELETE /agentes/:id
export function deletarAgente(id) {
  return request(`${BASE_URL}/${id}`, { method: "DELETE" });
}

// POST /agentes/login
export function loginAgente(email, senha) {
  return request(`${BASE_URL}/login`, {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
}

// PATCH /agentes/:id/sanidade
export function atualizarSanidade(id, sanidade) {
  return request(`${BASE_URL}/${id}/sanidade`, {
    method: "PATCH",
    body: JSON.stringify({ sanidade }),
  });
}
