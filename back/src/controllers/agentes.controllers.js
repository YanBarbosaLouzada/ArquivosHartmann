// controllers/agentes.controllers.js
import { Agente } from "../models/alunos.model.js"
import { gerarHashSenha, conferirSenha } from "../utils/senha.js"
import { restaurarSanidadeSeVencida, SANIDADE_MAXIMA } from "../utils/sanidade.js"

// GET /agentes
export async function listarAgentes(req, res, next){
  try{
    const { nome } = req.query;
    const filtro = {};

    if (nome) {
      filtro.nome = nome;
    }

    const agentes = await Agente.find(filtro).sort({ nome: 1 });
    res.json(agentes);
  } catch (erro) {
    next(erro);
  }
}

// GET /agentes/:id
export async function buscarAgente(req, res, next){
  try{
    const agente = await Agente.findById(req.params.id);

    if(!agente){
      const erro = new Error("Agente não encontrado");
      erro.status = 404;
      return next(erro);
    }
    res.json(await restaurarSanidadeSeVencida(agente));
  } catch (erro) {
    next (erro);
  }
}

// POST /agentes
export async function criarAgente(req, res, next) {
  try{
    const { nome, email, senha, elementoParanormal, classe, sanidade } = req.body

    const novoAgente = await Agente.create({
      nome, email, senha: gerarHashSenha(senha), elementoParanormal, classe, sanidade
    });

    res.status(201).json(novoAgente);
  } catch (erro) {
    next (erro);
  }
}

// POST /agentes/login
export async function loginAgente(req, res, next) {
  try{
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "Informe email e senha" });
    }

    const agente = await Agente.findOne({ email: email.trim().toLowerCase() });

    if (!agente || !conferirSenha(senha, agente.senha)) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }
    res.json(await restaurarSanidadeSeVencida(agente));
  } catch (erro) {
    next(erro);
  }
}

// PATCH /agentes/:id/sanidade
export async function atualizarSanidade(req, res, next) {
  try{
    const sanidade = Number(req.body.sanidade);

    if (!Number.isInteger(sanidade) || sanidade < 0 || sanidade > SANIDADE_MAXIMA) {
      return res.status(400).json({ erro: "A sanidade deve ser um número inteiro entre 0 e 20" });
    }

    const agente = await Agente.findByIdAndUpdate(
      req.params.id,
      { sanidade, sanidadeAtualizadaEm: new Date() },
      { new: true, runValidators: true }
    );

    if (!agente) {
      const erro = new Error("Agente não encontrado");
      erro.status = 404;
      return next(erro);
    }
    res.json(agente);
  } catch (erro) {
    next(erro);
  }
}

// PUT /agentes/:id
export async function atualizarAgente(req, res, next){
  try{
    const dados = { ...req.body, senha: gerarHashSenha(req.body.senha) };

    const agente = await Agente.findByIdAndUpdate(
      req.params.id,
      dados,
      { new: true, runValidators: true }
    );

    if (!agente) {
      const erro = new Error('Agente não encontrado')
      erro.status = 404;
      return next(erro);
    }
    res.json(agente);
  } catch (erro) {
    next(erro);
  }
}

// DELETE /agentes/:id
export async function deletarAgente(req, res, next) {
  try{
    const agente = await Agente.findByIdAndDelete(req.params.id);
    if (!agente) {
      const erro = new Error("Agente não encontrado");
      erro.status = 404;
      return next(erro);
    }
    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
}
