import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

export default function useResource(path) {
  const [items, setItems] = useState([]);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async (params = {}) => {
    try {
      const q = new URLSearchParams(params).toString();
      setItems(await api(q ? `${path}?${q}` : path));
      setErro('');
    } catch (e) { setErro(e.message); }
  }, [path]);

  useEffect(() => { carregar(); }, [carregar]);

  const salvar = async (dados, id) => {
    await api(id ? `${path}/${id}` : path, { method: id ? 'PUT' : 'POST', body: dados });
    await carregar();
  };
  const remover = async (id) => {
    try { await api(`${path}/${id}`, { method: 'DELETE' }); await carregar(); }
    catch (e) { setErro(e.message); }
  };
  return { items, erro, setErro, carregar, salvar, remover };
}
