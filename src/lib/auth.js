import jwt from 'jsonwebtoken';

export const autenticar = (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ erro: 'Sessão expirada ou inválida. Faça login novamente.' });
  }
};
