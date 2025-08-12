import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// TODO: Implement employee routes
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Employees endpoint - coming soon' });
});

export default router;