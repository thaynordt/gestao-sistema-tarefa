export const API_URL = 'http://localhost:3001/api';
export const STATUS = { PENDENTE: 'Pendente', ANDAMENTO: 'Em andamento', CONCLUIDA: 'Concluída' };
export const TELAS = { painel: 'Painel', colaboradores: 'Colaboradores', tarefas: 'Tarefas', agendamentos: 'Agendamentos' };
export const formatarData = (iso) => new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
