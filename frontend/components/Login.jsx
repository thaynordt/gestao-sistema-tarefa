import { useState } from 'react';
import { api } from '../api.js';

export default function Login({ onEntrar }) {
  const [f, setF] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');

  const enviar = async (e) => {
    e.preventDefault();
    try {
      const { token, usuario } = await api('/login', { method: 'POST', body: f });
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      onEntrar(usuario);
    } catch (x) { setErro(x.message); }
  };

  return (
    <form className="login" onSubmit={enviar}>
      <h1>Entrar</h1>
      {erro && <p className="erro" role="alert">{erro}</p>}
      <label>E-mail<input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></label>
      <label>Senha<input type="password" value={f.senha} onChange={(e) => setF({ ...f, senha: e.target.value })} required /></label>
      <button>Entrar</button>
    </form>
  );
}
