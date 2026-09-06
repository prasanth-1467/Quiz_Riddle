import express from 'express';
import { submitAnswer } from '../controllers/submissionController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyJWT, submitAnswer);

export default router;
