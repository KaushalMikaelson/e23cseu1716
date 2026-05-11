import { Router } from 'express';
import { Log } from 'logging_middleware';
import { getAll, getById, markRead } from '../controllers/notificationController';
import { validateNotificationQuery } from '../middleware/validateQuery';

const router = Router();

router.get(
  '/',
  (req, res, next) => {
    void Log('backend', 'info', 'route', 'GET /notifications hit').catch(() => {});
    next();
  },
  validateNotificationQuery,
  getAll,
);

router.get(
  '/:id',
  (req, res, next) => {
    void Log('backend', 'info', 'route', `GET /notifications/${req.params.id} hit`).catch(() => {});
    next();
  },
  getById,
);

router.patch(
  '/:id/read',
  (req, res, next) => {
    void Log('backend', 'info', 'route', `PATCH /notifications/${req.params.id}/read hit`).catch(() => {});
    next();
  },
  markRead,
);

export default router;
