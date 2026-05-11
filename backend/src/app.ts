import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Log } from 'logging_middleware';
import config from './config';
import router from './routes';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors({ origin: config.frontendOrigin }));
app.use(express.json());
app.use(requestLogger);

app.use('/api', router);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: config.nodeEnv });
});

app.use(errorHandler);

// Catch unhandled promise rejections so nodemon doesn't crash
process.on('unhandledRejection', (reason) => {
  process.stderr.write(`[app] Unhandled rejection: ${reason}\n`);
});

app.listen(config.port, () => {
  // void — intentional fire-and-forget; logging must never block startup
  void Log('backend', 'info', 'config', `Server running on http://localhost:${config.port}`).catch(() => {});
  process.stdout.write(`[server] http://localhost:${config.port}\n`);
});

export default app;

