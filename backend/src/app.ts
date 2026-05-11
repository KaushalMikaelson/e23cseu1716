import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Log } from 'logging_middleware';
import config from './config';
import router from './routes';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// --- Core middleware ---
app.use(cors({ origin: config.frontendOrigin }));
app.use(express.json());
app.use(requestLogger);

// --- API routes ---
app.use('/api', router);

// Health check (unauthenticated — for infra probing)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: config.nodeEnv });
});

// --- Global error handler (must be registered last) ---
app.use(errorHandler);

app.listen(config.port, () => {
  Log('backend', 'info', 'config', `Server running on http://localhost:${config.port}`);
});

export default app;
