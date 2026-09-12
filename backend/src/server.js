import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes/index.js';

// Vercel importa esta aplicación sin abrir un puerto ni ejecutar migraciones.
const app = express();
app.disable('x-powered-by');
const origins = (process.env.CORS_ORIGIN || '').split(',').map(value => value.trim()).filter(Boolean);
app.use(cors({
  origin(origin, done) {
    if (!origin || origins.includes(origin)) return done(null, true);
    const error = new Error('Origin not allowed');
    error.status = 403;
    done(error);
  },
  credentials: true,
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use('/api', router);
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
// Registra el detalle internamente y devuelve errores estables sin exponer SQL.
app.use((err, _req, res, _next) => {
  console.error('[HTTP]', err.message);
  const status = [400, 403, 413].includes(err.status) ? err.status : 500;
  res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
});
export default app;
