import { Router } from 'express';
import notificationRoutes from './notification.routes';
import priorityInboxRoutes from './priorityInbox.routes';

const router = Router();

router.use('/notifications', notificationRoutes);
router.use('/priority-inbox', priorityInboxRoutes);

export default router;
