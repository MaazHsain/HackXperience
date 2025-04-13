import express from 'express'
import userAuth from '../middleware/userAuth.js';
import { addGroupBuy, addRequestToBuy, addWishlist, removeWishlist, retrieveWishlist } from '../controllers/wishlistController.js';

const wishlistRouter = express.Router();

    wishlistRouter.get('/:groupId', userAuth, retrieveWishlist);
    wishlistRouter.post('/create', userAuth, addWishlist);
    wishlistRouter.delete('/remove', userAuth, removeWishlist);
    wishlistRouter.patch('/add-groupbuy', userAuth, addGroupBuy);
    wishlistRouter.patch('/add-request-to-buy', userAuth, addRequestToBuy);


export default wishlistRouter;