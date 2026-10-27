// routes/agentes.routes.js
import { Router } from 'express';
import {
  listarAgentes,
  buscarAgente,
  criarAgente,
  atualizarAgente,
  deletarAgente,
  loginAgente,
  atualizarSanidade,
} from '../controllers/agentes.controllers.js';
import { validarAgente } from '../middleware/validarAgente.js';

const router = Router();

router.get('/',       listarAgentes);
router.get('/:id',    buscarAgente);
router.post('/',      validarAgente, criarAgente);
router.post('/login', loginAgente);
router.put('/:id',    validarAgente, atualizarAgente);
router.patch('/:id/sanidade', atualizarSanidade);
router.delete('/:id', deletarAgente);

export default router;
