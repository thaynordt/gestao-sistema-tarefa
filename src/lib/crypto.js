import crypto from 'node:crypto';

const chave = () => Buffer.from(process.env.CRYPTO_KEY, 'hex');

// AES-256-GCM: retorna "iv:tag:dados" em base64
export const cifrar = (texto) => {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', chave(), iv);
  const dados = Buffer.concat([c.update(texto, 'utf8'), c.final()]);
  return [iv, c.getAuthTag(), dados].map((b) => b.toString('base64')).join(':');
};

export const decifrar = (valor) => {
  const [iv, tag, dados] = valor.split(':').map((x) => Buffer.from(x, 'base64'));
  const d = crypto.createDecipheriv('aes-256-gcm', chave(), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(dados), d.final()]).toString('utf8');
};
