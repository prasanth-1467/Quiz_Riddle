import express from 'express';
import { getQuestions, getQuestionByOrder, createQuestion } from '../controllers/questionController.js';
import { verifyJWT, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyJWT, getQuestions);
router.get('/order/:order', verifyJWT, getQuestionByOrder);
router.post('/', verifyJWT, requireRole('ADMIN'), createQuestion);

export default router;
