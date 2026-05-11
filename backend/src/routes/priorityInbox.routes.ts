import { Router } from 'express';
import { Log } from 'logging_middleware';
import { getPriorityInbox } from '../controllers/priorityInboxController';

const router = Router();

router.get(
  '/',
  (req, res, next) => {
    Log('backend', 'info', 'route', 'GET /priority-inbox hit');
    next();
  },
  getPriorityInbox,
);

export default router;
