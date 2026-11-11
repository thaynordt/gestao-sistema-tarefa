import { API_URL } from './constants.js';

export const getToken = () => localStorage.getItem('token');

export async function api(path, { method = 'GET', body } = {}) {
  const r = await fetch(API_URL + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(getToken() && { Authorization: `Bearer ${getToken()}` }) },
    body: body && JSON.stringify(body),
  });
  const dados = r.status === 204 ? null : await r.json().catch(() => null);
  if (!r.ok) {
    if (r.status === 401 && getToken()) { // token expirado
      localStorage.clear();
      window.dispatchEvent(new Event('logout'));
    }
    throw new Error(dados?.erro || 'Erro na requisição.');
  }
  return dados;
}
