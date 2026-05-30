import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// Esta é a única rota que precisamos
app.post('/api/admin/login', (req, res) => {
  const { user, pass } = req.body;
  
  // LOG PARA DEBUGAR (verifique nos logs da Vercel)
  console.log('Tentativa de login:', user);

  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
    return res.json({ ok: true });
  }
  
  return res.status(401).json({ error: 'Credenciais inválidas' });
});

export default app;