import express from 'express';
import { getRounds, createRound, updateRound, deleteRound } from '../controllers/roundController.js';
import { verifyJWT, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyJWT, getRounds);
router.post('/', verifyJWT, requireRole('ADMIN'), createRound);
router.put('/:id', verifyJWT, requireRole('ADMIN'), updateRound);
router.delete('/:id', verifyJWT, requireRole('ADMIN'), deleteRound);

export default router;