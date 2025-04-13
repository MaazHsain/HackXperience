import itemModel from "../models/itemModel.js";

export const retrieveItem = async(req, res) => {
    try{
        const { itemId } = req.params;

        const item = await itemModel.findById(itemId);

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        return res.json({success:true, item});
    } catch (error){
        return res.json({success: false, message: error.message});
    }
}

export const addItem = async(req, res) => {
    try{
        const {itemName, category, description, imageUrl, shoppingUrl} = req.body;
        if (!itemName || !category || !description || !imageUrl || !shoppingUrl) {
            return res.json({success: false, message: 'Missing required fields'});
        }

        const newItem = new itemModel({
            itemName,
            category,
            description,
            imageUrl,
            shoppingUrl,
        });

        await newItem.save();
        return res.json({success:true, message: "New item created successfully!"});
    } catch (error){
        return res.json({success: false, message: error.message});
    }
}

export const retrieveItems = async (req, res) => {
    try {
      const items = await itemModel.find({}, "_id itemName"); // only return _id and itemName
  
      return res.json({ success: true, items });
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  };