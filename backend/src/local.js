import app from './server.js';
import pool, { testConnection } from './db/index.js';

// El listener existe sólo para npm start/dev, fuera de la función de Vercel.
if (await testConnection()) {
  const server = app.listen(process.env.PORT || 3001, () => console.log('Backend ready'));
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
    server.close(() => { void pool.end(); });
  });
} else {
  await pool.end();
  process.exitCode = 1;
}
