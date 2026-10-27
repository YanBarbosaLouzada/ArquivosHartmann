// utils/dados.js
// Interpreta e rola expressões de dados, como as de RPG de mesa.
//
// Exemplos aceitos:
//   d20        -> 1 dado de 20 lados
//   2d6        -> 2 dados de 6 lados, somados
//   2d20+3     -> 2d20 somados, mais 3
//   1d100-10   -> 1d100, menos 10
//   3d20kh     -> rola 3d20 e vale só o MAIOR (regra de atributo do Ordem Paranormal)

// Limites para ninguém travar o servidor pedindo "99999d99999"
const MAX_DADOS = 20;
const MAX_LADOS = 1000;

// Como ler a expressão (cada parte entre parênteses é um "grupo"):
//   (\d*)           quantidade de dados (pode ficar vazia: "d20" vira 1)
//   d(\d+)          o "d" e a quantidade de lados
//   (kh)?           opcional: manter o maior
//   ([+-]\d+)?      opcional: modificador com sinal
const PADRAO = /^(\d*)d(\d+)(kh)?([+-]\d+)?$/i;

// Sorteia um número inteiro de 1 até "lados"
function rolarUmDado(lados) {
  return Math.floor(Math.random() * lados) + 1;
}

// Recebe um texto como "2d20+3".
// Devolve o resultado da rolagem, ou { erro } se a expressão for inválida.
export function rolarExpressao(texto) {
  // Tira espaços e deixa minúsculo: "2D20 + 3" vira "2d20+3"
  const expressao = String(texto).replace(/\s+/g, "").toLowerCase();

  const partes = PADRAO.exec(expressao);
  if (!partes) {
    return { erro: "Use o formato 2d20+3 (quantidade, d, lados e modificador opcional)" };
  }

  const quantidade = partes[1] === "" ? 1 : Number(partes[1]);
  const lados = Number(partes[2]);
  const manterMaior = Boolean(partes[3]);
  const modificador = partes[4] ? Number(partes[4]) : 0;

  if (quantidade < 1 || quantidade > MAX_DADOS) {
    return { erro: `Role de 1 a ${MAX_DADOS} dados por vez` };
  }
  if (lados < 2 || lados > MAX_LADOS) {
    return { erro: `Os dados devem ter de 2 a ${MAX_LADOS} lados` };
  }

  // Rola cada dado e guarda o que saiu em uma lista
  const dados = [];
  for (let i = 0; i < quantidade; i++) {
    dados.push(rolarUmDado(lados));
  }

  // Com "kh" vale só o maior; sem ele, soma tudo
  const base = manterMaior
    ? Math.max(...dados)
    : dados.reduce((soma, valor) => soma + valor, 0);

  return {
    expressao,
    quantidade,
    lados,
    dados,
    modificador,
    manterMaior,
    total: base + modificador,
  };
}
