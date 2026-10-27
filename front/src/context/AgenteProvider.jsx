import { useCallback, useEffect, useMemo, useState } from "react";
import {
  atualizarSanidade,
  buscarAgente,
  criarAgente,
  loginAgente,
} from "../services/agentesApi.js";
import { AgenteContext, SANIDADE_MAXIMA } from "./agenteContext.js";

// A sanidade volta ao máximo 1h depois da última alteração (o backend é quem decide)
const UMA_HORA = 60 * 60 * 1000;

// O agente logado fica salvo no navegador para não precisar entrar de novo a cada F5
const CHAVE = "ordo:agente";

function lerAgenteSalvo() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE));
  } catch {
    return null;
  }
}

function salvarAgente(agente) {
  try {
    if (agente) localStorage.setItem(CHAVE, JSON.stringify(agente));
    else localStorage.removeItem(CHAVE);
  } catch {
    // sem localStorage (aba anônima etc.): a sessão só dura até recarregar
  }
}

export default function AgenteProvider({ children }) {
  const [agente, setAgenteState] = useState(lerAgenteSalvo);

  const setAgente = useCallback((novo) => {
    salvarAgente(novo);
    setAgenteState(novo);
  }, []);

  // Ao abrir o site, confere com o backend se o agente ainda existe e pega a sanidade atual
  const idSalvo = agente?._id;
  useEffect(() => {
    if (!idSalvo) return;
    buscarAgente(idSalvo)
      .then(setAgente)
      .catch((e) => {
        if (e.message === "Agente não encontrado") setAgente(null);
      });
  }, [idSalvo, setAgente]);

  // Com a aba aberta, pede o agente de novo quando completar 1h para pegar a sanidade restaurada
  const sanidadeAtual = agente?.sanidade;
  const alteradaEm = agente?.sanidadeAtualizadaEm;
  useEffect(() => {
    if (!idSalvo || sanidadeAtual >= SANIDADE_MAXIMA || !alteradaEm) return;
    const falta = new Date(alteradaEm).getTime() + UMA_HORA - Date.now();
    const timer = setTimeout(() => {
      buscarAgente(idSalvo).then(setAgente).catch(() => {});
    }, Math.max(0, falta) + 1000);
    return () => clearTimeout(timer);
  }, [idSalvo, sanidadeAtual, alteradaEm, setAgente]);

  const entrar = useCallback(
    async (email, senha) => setAgente(await loginAgente(email, senha)),
    [setAgente]
  );

  const cadastrar = useCallback(
    async (dados) => setAgente(await criarAgente({ ...dados, sanidade: SANIDADE_MAXIMA })),
    [setAgente]
  );

  const sair = useCallback(() => setAgente(null), [setAgente]);

  // Atualiza na tela na hora e depois grava no banco
  const perderSanidade = useCallback(
    (quantidade) => {
      if (!agente) return;
      const sanidade = Math.max(0, (agente.sanidade ?? SANIDADE_MAXIMA) - quantidade);
      if (sanidade === agente.sanidade) return;
      setAgente({ ...agente, sanidade, sanidadeAtualizadaEm: new Date().toISOString() });
      atualizarSanidade(agente._id, sanidade).catch((e) =>
        console.error("Não foi possível salvar a sanidade:", e.message)
      );
    },
    [agente, setAgente]
  );

  const ganharSanidade = useCallback(
    (quantidade) => {
      if (!agente) return;
      const sanidade = Math.min(SANIDADE_MAXIMA, (agente.sanidade ?? SANIDADE_MAXIMA) + quantidade);
      if (sanidade === agente.sanidade) return;
      setAgente({ ...agente, sanidade, sanidadeAtualizadaEm: new Date().toISOString() });
      atualizarSanidade(agente._id, sanidade).catch((e) =>
        console.error("Não foi possível salvar a sanidade:", e.message)
      );
    },
    [agente, setAgente]
  );


  const valor = useMemo(
    () => ({ agente, entrar, cadastrar, sair, perderSanidade, ganharSanidade }),
    [agente, entrar, cadastrar, sair, perderSanidade, ganharSanidade]
  );

  return <AgenteContext.Provider value={valor}>{children}</AgenteContext.Provider>;
}
