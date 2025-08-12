import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// TODO: Implement reports routes
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Reports endpoint - coming soon' });
});

export default router;