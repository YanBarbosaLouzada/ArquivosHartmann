// models/canal.model.js
// Um canal é uma "sala" do chat. Cada sessão de RPG usa o seu próprio canal.
import mongoose from "mongoose";

const canalSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, "O nome do canal é obrigatório"],
    trim: true,
    minlength: [2, "O nome do canal deve ter no mínimo 2 caracteres"],
    maxlength: [30, "O nome do canal deve ter no máximo 30 caracteres"],
    unique: true, // dois canais com o mesmo nome confundiriam os jogadores
  },

  // Nome de quem criou o canal (só para exibir)
  criadoPor: {
    type: String,
    trim: true,
    default: "sistema",
  },
}, {
  timestamps: true, // o Mongoose cria createdAt e updatedAt sozinho
});

export const Canal = mongoose.model("Canal", canalSchema);
