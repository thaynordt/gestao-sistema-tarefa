import { useEffect, useState } from 'react';
import { TELAS } from './constants.js';
import Login from './components/Login.jsx';
import Painel from './components/Painel.jsx';
import Colaboradores from './components/Colaboradores.jsx';
import Tarefas from './components/Tarefas.jsx';
import Agendamentos from './components/Agendamentos.jsx';

const telas = { painel: Painel, colaboradores: Colaboradores, tarefas: Tarefas, agendamentos: Agendamentos };

export default function App() {
  const [usuario, setUsuario] = useState(() => JSON.parse(localStorage.getItem('usuario') || 'null'));
  const [tela, setTela] = useState('painel');

  const sair = () => { localStorage.clear(); setUsuario(null); setTela('painel'); };
  useEffect(() => { window.addEventListener('logout', sair); return () => window.removeEventListener('logout', sair); }, []);

  if (!usuario) return <Login onEntrar={setUsuario} />;
  const Tela = telas[tela];
  return (
    <>
      <header className="topo">
        <strong>Gestão de Tarefas</strong>
        <nav>
          {Object.entries(TELAS).map(([k, nome]) => (
            <button key={k} className={k === tela ? 'ativo' : ''} onClick={() => setTela(k)}>{nome}</button>
          ))}
        </nav>
        <span className="usuario">{usuario.nome}</span>
        <button className="sair" onClick={sair}>Sair</button>
      </header>
      <main><Tela usuario={usuario} irPara={setTela} /></main>
    </>
  );
}
