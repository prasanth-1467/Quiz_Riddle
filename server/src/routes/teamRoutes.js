import express from 'express';
import { createTeam, joinTeam, getTeamDetails, getLeaderboard } from '../controllers/teamController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', verifyJWT, createTeam);
router.post('/join', verifyJWT, joinTeam);
router.get('/leaderboard', getLeaderboard);
router.get('/:id', verifyJWT, getTeamDetails);

export default router;
