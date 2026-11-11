import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Painel({ usuario, irPara }) {
  const [r, setR] = useState(null);
  useEffect(() => { api('/resumo').then(setR).catch(() => {}); }, []);
  const cards = [['colaboradores', 'Colaboradores'], ['tarefas', 'Tarefas'], ['agendamentos', 'Agendamentos']];
  return (
    <>
      <h1>Olá, {usuario.nome}</h1>
      <div className="cards">
        {cards.map(([k, nome]) => (
          <button key={k} className="card" onClick={() => irPara(k)}>
            <span className="num">{r ? r[k] : '–'}</span>{nome}
          </button>
        ))}
      </div>
    </>
  );
}
