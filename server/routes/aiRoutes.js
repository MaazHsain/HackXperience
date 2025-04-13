import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { suggestGiftIdeas } from '../controllers/aiController.js';

const aiRouter = express.Router();

// POST /api/ai/suggest
aiRouter.post('/suggest', userAuth, suggestGiftIdeas);

export default aiRouter;
