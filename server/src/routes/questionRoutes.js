import express from 'express';
import { getQuestions, getQuestionByOrder, createQuestion, updateQuestion, deleteQuestion } from '../controllers/questionController.js';
import { verifyJWT, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyJWT, getQuestions);
router.get('/order/:order', verifyJWT, getQuestionByOrder);
router.post('/', verifyJWT, requireRole('ADMIN'), createQuestion);
router.put('/:id', verifyJWT, requireRole('ADMIN'), updateQuestion);
router.delete('/:id', verifyJWT, requireRole('ADMIN'), deleteQuestion);

export default router;
