// A sanidade volta ao máximo 1h depois da última vez que foi alterada
export const SANIDADE_MAXIMA = 20;
export const UMA_HORA = 60 * 60 * 1000;

// Se o prazo venceu, restaura a sanidade do agente e salva
export async function restaurarSanidadeSeVencida(agente) {
  if (!agente || agente.sanidade >= SANIDADE_MAXIMA) return agente;

  const ultimaAlteracao = agente.sanidadeAtualizadaEm?.getTime() ?? 0;
  if (Date.now() - ultimaAlteracao >= UMA_HORA) {
    agente.sanidade = SANIDADE_MAXIMA;
    agente.sanidadeAtualizadaEm = undefined;
    await agente.save();
  }
  return agente;
}
