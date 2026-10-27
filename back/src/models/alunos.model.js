// // models/alunos.model.js
// export let agentes = [
//   { id: 1, nome: 'Agatha Volkmenn', email: 'AgatinhaDoRitual@gmail.com', senha: 'Tr4nsc3nd3r', elementoParanormal: 'Sangue', classe: 'Ocultista', sanidade: 20 },
//   { id: 2, nome: 'Arthur Cervero', email: 'ArthurzinhoGuitarrista@gmail.com', senha: 'gatinhaJennifer123', elementoParanormal: 'Sangue', classe: 'Especialista', sanidade: 20 },
//   { id: 3, nome: 'Dante Gaspar', email: 'Gaspar1993@gmail.com', senha: 'JasminnSM', elementoParanormal: 'Morte', classe: 'Ocultista', sanidade: 20 },
// ];

// export function setAgentes(novaLista) {
//   agentes = novaLista;
// }

import mongoose from "mongoose";

const agenteSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, "O nome do agente é obrigatório"],
    trim: true,
    minlength: [3, "O nome do agente deve ter no mínimo 3 caracteres"],
    maxlength: [50, "O nome do agente deve ter no máximo 50 caracteres"]
  },

  email: {
    type: String,
    required: [true, "O email do agente é obrigatório"],
    trim: true,
    lowercase: true,
    unique: true,
  },

  senha: {
    type: String,
    required: [true, "A senha do agente é obrigatória"],
    trim: true,
    minlength: [8, "A senha do agente deve ter no mínimo 8 caracteres"]
  },

  elementoParanormal: {
    type: String,
    required: [true, "O elemento Paranormal do agente é obrigatório"],
    trim: true,
    minlength: [5, "O elemento Paranormal do agente deve ter no mínimo 5 caracteres"],
    maxlength: [12, "O elemento Paranormal do agente deve ter no máximo 12 caracteres"]
  },

  classe: {
    type: String,
    required: [true, "A classe do agente é obrigatória"],
    trim: true,
    minlength: [9, "A classe do agente deve ter no mínimo 9 caracteres"],
    maxlength: [12, "A classe do agente deve ter no máximo 12 caracteres"]
  },

  sanidade: {
    type: Number,
    required: [true, "A sanidade do agente é obrigatória"],
    default: 20,
    min: [0, "A sanidade do agente não pode ser menor que 0"],
    max: [20, "A sanidade do agente não pode ser maior que 20"]
  },

  // Quando a sanidade foi alterada pela última vez (base do reset de 1h)
  sanidadeAtualizadaEm: { type: Date },
}, {
  // A senha (hash) nunca sai da API
  toJSON: {
    transform(doc, ret) {
      delete ret.senha;
      return ret;
    }
  }
});

export const Agente = mongoose.model("Agente", agenteSchema);