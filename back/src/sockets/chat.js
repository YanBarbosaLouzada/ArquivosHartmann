// sockets/chat.js
// Toda a lógica de tempo real do chat: canais, mensagens e dados.
//
// Como funciona (resumo):
//  - Cada canal é uma "sala" (room) do socket.io. Quando o socket entra numa
//    sala, só recebe o que for enviado para ela. É assim que duas sessões de
//    RPG conversam ao mesmo tempo sem ver as mensagens uma da outra.
//  - O cliente fala com o servidor usando "eventos". Os que pedem uma resposta
//    usam um "ack": uma função que o servidor chama para devolver o resultado.

import mongoose from "mongoose";
import { Agente } from "../models/alunos.model.js";
import { Canal } from "../models/canal.model.js";
import { Mensagem } from "../models/mensagem.model.js";
import { rolarExpressao } from "../utils/dados.js";

const MENSAGENS_NO_HISTORICO = 50;

// Um ack pode não ser enviado pelo cliente; assim evitamos um erro por isso
function garantirAck(ack) {
  return typeof ack === "function" ? ack : () => {};
}

// Cria o canal "geral" se o banco ainda não tiver nenhum canal
async function criarCanalPadrao() {
  const total = await Canal.countDocuments();
  if (total === 0) {
    await Canal.create({ nome: "geral", criadoPor: "sistema" });
    console.log('Canal padrão "geral" criado');
  }
}

// Devolve todos os canais, do mais antigo para o mais novo
function listarCanais() {
  return Canal.find().sort({ createdAt: 1 });
}

// Rola os dados NO SERVIDOR (o jogador não consegue forçar um 20)
// e publica o resultado no canal em que ele está.
async function rolar(socket, io, expressao, ack) {
  try {
    const canalId = socket.data.canalId;
    if (!canalId) {
      return ack({ ok: false, erro: "Entre em um canal primeiro" });
    }

    const resultado = rolarExpressao(expressao);
    if (resultado.erro) {
      return ack({ ok: false, erro: resultado.erro });
    }

    const mensagem = await Mensagem.create({
      canalId,
      tipo: "rolagem",
      autorId: socket.data.agenteId,
      autorNome: socket.data.nome,
      rolagem: resultado,
    });

    io.to(canalId).emit("receive_message", mensagem);
    ack({ ok: true });
  } catch (erro) {
    ack({ ok: false, erro: erro.message });
  }
}

export async function registrarChat(io) {
  await criarCanalPadrao();

  // ---------------------------------------------------------------
  // Middleware: roda UMA vez quando o cliente tenta conectar.
  // O front manda o agenteId em "auth". O NOME não é confiável (o cliente
  // poderia mandar qualquer um), então ele vem do banco de dados.
  // ---------------------------------------------------------------
  io.use(async (socket, next) => {
    try {
      const { agenteId } = socket.handshake.auth;

      // isValidObjectId evita um erro do Mongo quando o id vem em formato errado
      if (!mongoose.isValidObjectId(agenteId)) {
        return next(new Error("Faça login para usar o chat"));
      }

      const agente = await Agente.findById(agenteId);
      if (!agente) {
        return next(new Error("Agente não encontrado"));
      }

      // socket.data é o lugar oficial para guardar dados próprios de cada conexão
      socket.data.agenteId = String(agente._id);
      socket.data.nome = agente.nome;
      next();
    } catch (erro) {
      next(erro);
    }
  });

  io.on("connection", (socket) => {
    console.log(`${socket.data.nome} conectou (${socket.id})`);

    // -------------------------------------------------------------
    // Canais: listar
    // -------------------------------------------------------------
    socket.on("listar_canais", async (ack) => {
      ack = garantirAck(ack);
      try {
        ack({ ok: true, canais: await listarCanais() });
      } catch (erro) {
        ack({ ok: false, erro: erro.message });
      }
    });

    // -------------------------------------------------------------
    // Canais: criar
    // -------------------------------------------------------------
    socket.on("criar_canal", async (nome, ack) => {
      ack = garantirAck(ack);
      try {
        const canal = await Canal.create({ nome, criadoPor: socket.data.nome });

        // Avisa TODO MUNDO que a lista de canais mudou
        io.emit("canais_atualizados", await listarCanais());
        ack({ ok: true, canal });
      } catch (erro) {
        // 11000 = nome repetido (índice unique do Mongo)
        const mensagem = erro.code === 11000
          ? "Já existe um canal com esse nome"
          : erro.message;
        ack({ ok: false, erro: mensagem });
      }
    });

    // -------------------------------------------------------------
    // Canais: entrar
    // Sai do canal anterior (se houver), entra na sala nova e
    // devolve o histórico das últimas mensagens.
    // -------------------------------------------------------------
    socket.on("entrar_canal", async (canalId, ack) => {
      ack = garantirAck(ack);
      try {
        const canal = await Canal.findById(canalId);
        if (!canal) {
          return ack({ ok: false, erro: "Canal não encontrado" });
        }

        // Sai da sala anterior para não receber mensagens de dois canais
        if (socket.data.canalId) {
          socket.leave(socket.data.canalId);
        }

        socket.join(String(canal._id));
        socket.data.canalId = String(canal._id);

        // Pega as 50 mais recentes (ordem decrescente) e inverte para
        // ficarem da mais antiga para a mais nova, como num chat
        const recentes = await Mensagem.find({ canalId: canal._id })
          .sort({ createdAt: -1 })
          .limit(MENSAGENS_NO_HISTORICO);

        ack({ ok: true, canal, mensagens: recentes.reverse() });
      } catch (erro) {
        ack({ ok: false, erro: erro.message });
      }
    });

    // -------------------------------------------------------------
    // Mensagem de texto. Se começar com "/r ", vira uma rolagem.
    // -------------------------------------------------------------
    socket.on("message", async (texto, ack) => {
      ack = garantirAck(ack);
      try {
        const canalId = socket.data.canalId;
        if (!canalId) {
          return ack({ ok: false, erro: "Entre em um canal primeiro" });
        }

        const limpo = String(texto ?? "").trim();
        if (!limpo) {
          return ack({ ok: false, erro: "Mensagem vazia" });
        }

        // "/r 2d20+3" -> tira o "/r" e manda o resto para a rolagem
        if (/^\/r(\s|$)/i.test(limpo)) {
          return rolar(socket, io, limpo.slice(2), ack);
        }

        const mensagem = await Mensagem.create({
          canalId,
          tipo: "texto",
          autorId: socket.data.agenteId,
          autorNome: socket.data.nome,
          texto: limpo,
        });

        // io.to(sala) envia só para quem está naquele canal
        io.to(canalId).emit("receive_message", mensagem);
        ack({ ok: true });
      } catch (erro) {
        ack({ ok: false, erro: erro.message });
      }
    });

    // -------------------------------------------------------------
    // Rolagem pelos botões de dado do front
    // -------------------------------------------------------------
    socket.on("rolar_dado", (expressao, ack) => {
      rolar(socket, io, expressao, garantirAck(ack));
    });

    socket.on("disconnect", () => {
      console.log(`${socket.data.nome} desconectou (${socket.id})`);
    });
  });
}
