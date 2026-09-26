import express from 'express';
import { seedDemoData } from '../utils/seedDemoData.js';

const router = express.Router();

router.post('/seed', async (req, res, next) => {
  try {
    const result = await seedDemoData();
    res.status(200).json({
      message: 'Demo dataset populated successfully.',
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
