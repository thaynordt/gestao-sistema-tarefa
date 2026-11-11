import { useState } from 'react';
import useResource from '../useResources.js';
import { STATUS } from '../constants.js';

const vazio = { titulo: '', descricao: '', status: 'PENDENTE', colaboradorId: '' };

export default function Tarefas() {
  const { items, erro, setErro, salvar, remover } = useResource('/tarefas');
  const colabs = useResource('/colaboradores').items;
  const [f, setF] = useState(vazio);
  const [id, setId] = useState(null);
  const campo = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });

  const enviar = async (e) => {
    e.preventDefault();
    try { await salvar(f, id); setF(vazio); setId(null); setErro(''); } catch (x) { setErro(x.message); }
  };

  return (
    <>
      <h1>Tarefas</h1>
      {erro && <p className="erro" role="alert">{erro}</p>}
      <form className="grade" onSubmit={enviar}>
        <input placeholder="Título" {...campo('titulo')} required />
        <input placeholder="Descrição" {...campo('descricao')} />
        <select {...campo('status')}>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select {...campo('colaboradorId')} required>
          <option value="">Responsável…</option>
          {colabs.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <button>{id ? 'Salvar alterações' : 'Cadastrar tarefa'}</button>
        {id && <button type="button" onClick={() => { setId(null); setF(vazio); }}>Cancelar</button>}
      </form>
      <table>
        <thead><tr><th>Título</th><th>Descrição</th><th>Status</th><th>Responsável</th><th></th></tr></thead>
        <tbody>
          {items.map((t) => (
            <tr key={t.id}>
              <td>{t.titulo}</td><td>{t.descricao}</td><td>{STATUS[t.status]}</td><td>{t.colaborador.nome}</td>
              <td className="acoes">
                <button onClick={() => { setId(t.id); setF({ titulo: t.titulo, descricao: t.descricao || '', status: t.status, colaboradorId: t.colaboradorId }); }}>Editar</button>
                <button onClick={() => window.confirm('Remover tarefa?') && remover(t.id)}>Remover</button>
              </td>
            </tr>
          ))}
          {!items.length && <tr><td colSpan="5">Nenhuma tarefa cadastrada.</td></tr>}
        </tbody>
      </table>
    </>
  );
}
