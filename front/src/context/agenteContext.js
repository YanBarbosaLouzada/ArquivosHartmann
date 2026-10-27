import { createContext, useContext } from "react";

export const SANIDADE_MAXIMA = 20;

export const AgenteContext = createContext(null);

// Agente logado + ações (entrar, cadastrar, sair, perderSanidade)
export function useAgente() {
  return useContext(AgenteContext);
}
