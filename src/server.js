import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './lib/prisma.js';
import { cifrar, decifrar } from './lib/crypto.js';
import { autenticar } from './lib/auth.js';

const app = express();
app.use(cors(), express.json());

const falha = (status, msg) => Object.assign(new Error(msg), { status });
const exigir = (obj, campos) => {
  for (const c of campos) if (!obj[c]) throw falha(400, `Campo obrigatório: ${c}`);
};
const tentar = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    if (e.code === 'P2003') return res.status(409).json({ erro: 'Registro possui vínculos e não pode ser removido.' });
    if (e.code === 'P2002') return res.status(409).json({ erro: 'Valor já cadastrado (campo único).' });
    if (e.code === 'P2025') return res.status(404).json({ erro: 'Registro não encontrado.' });
    if (!e.status) console.error(e);
    res.status(e.status || 500).json({ erro: e.status ? e.message : 'Erro interno.' });
  });

// ---------- Login ----------
app.post('/api/login', tentar(async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) throw falha(400, 'Informe e-mail e senha.');
  const u = await prisma.usuario.findUnique({ where: { email } });
  if (!u || !(await bcrypt.compare(senha, u.senha))) throw falha(401, 'Usuário ou senha inválidos.');
  const token = jwt.sign({ id: u.id, nome: u.nome }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, usuario: { nome: u.nome, email: u.email } });
}));

app.use('/api', autenticar);

app.get('/api/resumo', tentar(async (_req, res) => {
  const [colaboradores, tarefas, agendamentos] = await Promise.all([
    prisma.colaborador.count(), prisma.tarefa.count(), prisma.agendamento.count(),
  ]);
  res.json({ colaboradores, tarefas, agendamentos });
}));

// ---------- Colaboradores ----------
const limparCpf = (cpf) => {
  const d = String(cpf || '').replace(/\D/g, '');
  if (d.length !== 11) throw falha(400, 'CPF inválido: informe 11 dígitos.');
  return d;
};
const mascarar = (c) => {
  const d = decifrar(c.cpf);
  return { ...c, cpf: `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**` };
};

app.get('/api/colaboradores', tentar(async (req, res) => {
  const b = (req.query.busca || '').trim();
  const where = b ? { OR: [{ nome: { contains: b } }, { email: { contains: b } }, { cargo: { contains: b } }] } : {};
  const lista = await prisma.colaborador.findMany({ where, orderBy: { nome: 'asc' } });
  res.json(lista.map(mascarar));
}));

app.post('/api/colaboradores', tentar(async (req, res) => {
  const { nome, email, cargo, cpf } = req.body;
  exigir(req.body, ['nome', 'email', 'cargo']);
  const c = await prisma.colaborador.create({ data: { nome, email, cargo, cpf: cifrar(limparCpf(cpf)) } });
  res.status(201).json(mascarar(c));
}));

app.put('/api/colaboradores/:id', tentar(async (req, res) => {
  const { nome, email, cargo, cpf } = req.body;
  exigir(req.body, ['nome', 'email', 'cargo']);
  const data = { nome, email, cargo, ...(cpf ? { cpf: cifrar(limparCpf(cpf)) } : {}) };
  res.json(mascarar(await prisma.colaborador.update({ where: { id: +req.params.id }, data })));
}));

app.delete('/api/colaboradores/:id', tentar(async (req, res) => {
  await prisma.colaborador.delete({ where: { id: +req.params.id } });
  res.status(204).end();
}));

// ---------- Tarefas ----------
const comResponsavel = { colaborador: { select: { id: true, nome: true, email: true, cargo: true } } };

const validarTarefa = async (b) => {
  exigir(b, ['titulo', 'colaboradorId']);
  const existe = await prisma.colaborador.findUnique({ where: { id: +b.colaboradorId } });
  if (!existe) throw falha(400, 'Colaborador responsável não encontrado.');
  return { titulo: b.titulo, descricao: b.descricao || null, status: b.status || 'PENDENTE', colaboradorId: +b.colaboradorId };
};

app.get('/api/tarefas', tentar(async (_req, res) => {
  res.json(await prisma.tarefa.findMany({ include: comResponsavel, orderBy: { id: 'desc' } }));
}));
app.post('/api/tarefas', tentar(async (req, res) => {
  res.status(201).json(await prisma.tarefa.create({ data: await validarTarefa(req.body), include: comResponsavel }));
}));
app.put('/api/tarefas/:id', tentar(async (req, res) => {
  res.json(await prisma.tarefa.update({ where: { id: +req.params.id }, data: await validarTarefa(req.body), include: comResponsavel }));
}));
app.delete('/api/tarefas/:id', tentar(async (req, res) => {
  await prisma.tarefa.delete({ where: { id: +req.params.id } });
  res.status(204).end();
}));

// ---------- Agendamentos (ordenados por data de entrega) ----------
const incluirTudo = { tarefa: { include: comResponsavel } };
const dadosAgenda = async (b) => {
  exigir(b, ['tarefaId', 'dataEntrega']);
  if (!(await prisma.tarefa.findUnique({ where: { id: +b.tarefaId } }))) throw falha(400, 'Tarefa não encontrada.');
  const data = new Date(`${String(b.dataEntrega).slice(0, 10)}T00:00:00.000Z`);
  if (isNaN(data)) throw falha(400, 'Data inválida.');
  return { tarefaId: +b.tarefaId, dataEntrega: data, observacao: b.observacao || null };
};

app.get('/api/agendamentos', tentar(async (_req, res) => {
  res.json(await prisma.agendamento.findMany({ include: incluirTudo, orderBy: { dataEntrega: 'asc' } }));
}));
app.post('/api/agendamentos', tentar(async (req, res) => {
  res.status(201).json(await prisma.agendamento.create({ data: await dadosAgenda(req.body), include: incluirTudo }));
}));
app.put('/api/agendamentos/:id', tentar(async (req, res) => {
  res.json(await prisma.agendamento.update({ where: { id: +req.params.id }, data: await dadosAgenda(req.body), include: incluirTudo }));
}));
app.delete('/api/agendamentos/:id', tentar(async (req, res) => {
  await prisma.agendamento.delete({ where: { id: +req.params.id } });
  res.status(204).end();
}));

app.listen(process.env.PORT || 3001, () => console.log('API rodando'));
