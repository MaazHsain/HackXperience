import groupModel from "../models/groupModel.js";
import wishlistModel from "../models/wishlistModel.js";

export const retrieveWishlist = async(req, res) => {
    try{
        const { groupId } = req.params;
        if (!groupId) {
            return res.json({success: false, message: 'Group not provided'});
        }
        // check if group exist
        const group = await groupModel.findById(groupId);
        if (!group) {
            return res.json({success: false, message: 'Group not found'});
        }
        const wishlists = await wishlistModel
        .find({groupId})
        .populate("creatorId", "name")
        .populate("itemId")
        .populate("buyAsGroup", "name")
        .populate("requestToBuy", "name");

        return res.json({success:true, wishlists});
    } catch (error){
        return res.json({success: false, message: error.message});
    }
}

export const addWishlist = async(req, res) => {
    try{
        const {creatorId, groupId, itemId} = req.body;
        if (!creatorId || !groupId || !itemId) {
            return res.json({success: false, message: 'Missing required fields'});
        }

        const newWishlist = new wishlistModel({
            creatorId,
            groupId,
            itemId,
        });

        await newWishlist.save();
        return res.json({success:true, message: "New wishlist created successfully!"});
    } catch (error){
        return res.json({success: false, message: error.message});
    }
}

export const removeWishlist = async(req, res)=>{
    try{
        const { userId, wishlistId } = req.body;
        // check if wishlist exist
        const wishlist = await wishlistModel.findById(wishlistId);
        if (!wishlist) {
            return res.json({success: false, message: 'Wishlist not found'});
        }
        // check if wishlist is from user
        if (wishlist.creatorId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized to delete this wishlist' });
        }
        // remove wishlist
        await wishlistModel.findByIdAndDelete(wishlistId);

        return res.json({success: true, message: "Item removed from wishlist"})

    } catch (error){
        return res.json({success: false, message: error.message});
    }
}

export const addGroupBuy = async(req, res)=>{
    try{
        const { addedId, wishlistId } = req.body;

        // check if wishlist exist
        const wishlist = await wishlistModel.findById(wishlistId);
        if (!wishlist) {
            return res.json({success: false, message: 'Wishlist not found'});
        }

        // Prevent duplicate entries
        if (wishlist.buyAsGroup.includes(addedId)) {
            return res.status(400).json({ success: false, message: 'User already in group buy' });
        }

        // add user to group buy
        wishlist.buyAsGroup.push(addedId);
        await wishlist.save();

        return res.json({success: true, message: "User added to group buy for wishlist"})

    } catch (error){
        return res.json({success: false, message: error.message});
    }
}

export const addRequestToBuy = async(req, res)=>{
    try{
        const { creatorId, wishlistId } = req.body;
        // check if wishlist exist
        const wishlist = await wishlistModel.findById(wishlistId);
        if (!wishlist) {
            return res.json({success: false, message: 'Wishlist not found'});
        }
        // check if someone already request to buy
        if (wishlist.requestToBuy) {
            return res.status(400).json({ success: false, message: 'Someone has already requested to buy this item' });
          }
        
        // add user to request
        wishlist.requestToBuy = creatorId;
        await wishlist.save();
        

        return res.json({success: true, message: "User added to group buy for wishlist"})

    } catch (error){
        return res.json({success: false, message: error.message});
    }
}
