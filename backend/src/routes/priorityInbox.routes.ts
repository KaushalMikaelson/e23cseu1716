import { Router } from 'express';
import { Log } from 'logging_middleware';
import { getPriorityInbox } from '../controllers/priorityInboxController';

const router = Router();

router.get(
  '/',
  (req, res, next) => {
    void Log('backend', 'info', 'route', `GET /priority-inbox hit — n=${req.query.n ?? 10}`).catch(() => {});
    next();
  },
  getPriorityInbox,
);

export default router;
