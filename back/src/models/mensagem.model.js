// models/mensagem.model.js
// Tudo o que é dito num canal fica guardado aqui, para quem entrar depois
// conseguir ler o histórico da sessão.
import mongoose from "mongoose";

const mensagemSchema = new mongoose.Schema({
  // A qual canal a mensagem pertence
  canalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Canal",
    required: true,
    index: true, // deixa a busca "mensagens deste canal" rápida
  },

  // "texto" = mensagem normal | "rolagem" = resultado de dados
  tipo: {
    type: String,
    enum: ["texto", "rolagem"],
    default: "texto",
  },

  autorId: { type: String, required: true }, // _id do agente
  autorNome: { type: String, required: true },

  // Preenchido quando tipo === "texto"
  texto: { type: String, trim: true, maxlength: 1000 },

  // Preenchido quando tipo === "rolagem"
  rolagem: {
    expressao: String,    // ex.: "2d20+3"
    quantidade: Number,   // quantos dados
    lados: Number,        // quantos lados cada dado tem
    dados: [Number],      // o que saiu em cada dado
    modificador: Number,  // o +3 do exemplo
    manterMaior: Boolean, // true se usou "kh" (vale só o maior dado)
    total: Number,        // resultado final
  },
}, {
  timestamps: true,
});

export const Mensagem = mongoose.model("Mensagem", mensagemSchema);
