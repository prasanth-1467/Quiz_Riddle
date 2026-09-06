import express from 'express';
import { getEventState, updateEventState, getSubmissions, getTeams, resetTeamProgress } from '../controllers/adminController.js';
import { verifyJWT, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/state', verifyJWT, requireRole('ADMIN'), getEventState);
router.put('/state', verifyJWT, requireRole('ADMIN'), updateEventState);
router.get('/submissions', verifyJWT, requireRole('ADMIN'), getSubmissions);
router.get('/teams', verifyJWT, requireRole('ADMIN'), getTeams);
router.put('/teams/:id/reset', verifyJWT, requireRole('ADMIN'), resetTeamProgress);

export default router;
