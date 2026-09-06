import express from 'express';
import { getEventState, updateEventState, getSubmissions } from '../controllers/adminController.js';
import { verifyJWT, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/state', getEventState);
router.put('/state', verifyJWT, requireRole('ADMIN'), updateEventState);
router.get('/submissions', verifyJWT, requireRole('ADMIN'), getSubmissions);

export default router;
