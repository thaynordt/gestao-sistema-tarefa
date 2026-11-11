import { useState } from 'react';
import useResource from '../useResources.js';

const vazio = { nome: '', email: '', cpf: '', cargo: '' };

export default function Colaboradores() {
  const { items, erro, setErro, carregar, salvar, remover } = useResource('/colaboradores');
  const [f, setF] = useState(vazio);
  const [id, setId] = useState(null);
  const [busca, setBusca] = useState('');
  const campo = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });

  const enviar = async (e) => {
    e.preventDefault();
    try { await salvar(f, id); setF(vazio); setId(null); setErro(''); } catch (x) { setErro(x.message); }
  };

  return (
    <>
      <h1>Colaboradores</h1>
      {erro && <p className="erro" role="alert">{erro}</p>}
      <form className="linha" onSubmit={(e) => { e.preventDefault(); carregar({ busca }); }}>
        <input placeholder="Buscar por nome, e-mail ou cargo" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <button>Buscar</button>
      </form>
      <form className="grade" onSubmit={enviar}>
        <input placeholder="Nome" {...campo('nome')} required />
        <input placeholder="E-mail" type="email" {...campo('email')} required />
        <input placeholder={id ? 'CPF (vazio mantém o atual)' : 'CPF (11 dígitos)'} {...campo('cpf')} required={!id} />
        <input placeholder="Cargo" {...campo('cargo')} required />
        <button>{id ? 'Salvar alterações' : 'Cadastrar colaborador'}</button>
        {id && <button type="button" onClick={() => { setId(null); setF(vazio); }}>Cancelar</button>}
      </form>
      <table>
        <thead><tr><th>Nome</th><th>E-mail</th><th>CPF</th><th>Cargo</th><th></th></tr></thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id}>
              <td>{c.nome}</td><td>{c.email}</td><td>{c.cpf}</td><td>{c.cargo}</td>
              <td className="acoes">
                <button onClick={() => { setId(c.id); setF({ nome: c.nome, email: c.email, cargo: c.cargo, cpf: '' }); }}>Editar</button>
                <button onClick={() => window.confirm('Remover colaborador?') && remover(c.id)}>Remover</button>
              </td>
            </tr>
          ))}
          {!items.length && <tr><td colSpan="5">Nenhum colaborador encontrado.</td></tr>}
        </tbody>
      </table>
    </>
  );
}
