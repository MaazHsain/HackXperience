import express from 'express'
import userAuth from '../middleware/userAuth.js';
import { addItem, retrieveItem, retrieveItems } from '../controllers/itemController.js';

const itemRouter = express.Router();

    itemRouter.get('/all', userAuth, retrieveItems);
    itemRouter.get('/:itemId', userAuth, retrieveItem);
    itemRouter.post('/create', userAuth, addItem);

export default itemRouter;