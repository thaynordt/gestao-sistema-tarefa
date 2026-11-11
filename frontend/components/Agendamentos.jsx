import { useState } from 'react';
import useResource from '../useResources.js';
import { STATUS, formatarData } from '../constants.js';

const vazio = { tarefaId: '', dataEntrega: '', observacao: '' };

export default function Agendamentos() {
  const { items, erro, setErro, salvar, remover } = useResource('/agendamentos');
  const tarefas = useResource('/tarefas').items;
  const [f, setF] = useState(vazio);
  const [id, setId] = useState(null);
  const campo = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });

  const enviar = async (e) => {
    e.preventDefault();
    try { await salvar(f, id); setF(vazio); setId(null); setErro(''); } catch (x) { setErro(x.message); }
  };

  return (
    <>
      <h1>Agendamentos</h1>
      {erro && <p className="erro" role="alert">{erro}</p>}
      <form className="grade" onSubmit={enviar}>
        <select {...campo('tarefaId')} required>
          <option value="">Tarefa…</option>
          {tarefas.map((t) => <option key={t.id} value={t.id}>{t.titulo}</option>)}
        </select>
        <input type="date" {...campo('dataEntrega')} required />
        <input placeholder="Observação" {...campo('observacao')} />
        <button>{id ? 'Salvar alterações' : 'Agendar entrega'}</button>
        {id && <button type="button" onClick={() => { setId(null); setF(vazio); }}>Cancelar</button>}
      </form>
      <table>
        <thead><tr><th>Entrega</th><th>Tarefa</th><th>Descrição</th><th>Status</th><th>Responsável</th><th>Observação</th><th></th></tr></thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id}>
              <td>{formatarData(a.dataEntrega)}</td>
              <td>{a.tarefa.titulo}</td><td>{a.tarefa.descricao}</td><td>{STATUS[a.tarefa.status]}</td>
              <td>{a.tarefa.colaborador.nome}<br /><small>{a.tarefa.colaborador.cargo} · {a.tarefa.colaborador.email}</small></td>
              <td>{a.observacao}</td>
              <td className="acoes">
                <button onClick={() => { setId(a.id); setF({ tarefaId: a.tarefaId, dataEntrega: a.dataEntrega.slice(0, 10), observacao: a.observacao || '' }); }}>Editar</button>
                <button onClick={() => window.confirm('Remover agendamento?') && remover(a.id)}>Remover</button>
              </td>
            </tr>
          ))}
          {!items.length && <tr><td colSpan="7">Nenhum agendamento cadastrado.</td></tr>}
        </tbody>
      </table>
    </>
  );
}
