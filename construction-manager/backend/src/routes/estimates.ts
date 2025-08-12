import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// TODO: Implement estimate routes
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Estimates endpoint - coming soon' });
});

export default router;