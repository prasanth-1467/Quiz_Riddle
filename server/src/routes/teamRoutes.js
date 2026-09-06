import express from 'express';
import { createTeam, joinTeam, joinIndividual, getTeamDetails, getLeaderboard } from '../controllers/teamController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', verifyJWT, createTeam);
router.post('/join', verifyJWT, joinTeam);
router.post('/individual', verifyJWT, joinIndividual);
router.get('/leaderboard', getLeaderboard);
router.get('/:id', verifyJWT, getTeamDetails);

export default router;
