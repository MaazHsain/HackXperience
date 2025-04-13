import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { type: String, required: true }, 
  description: { type: String, required: true },
  imageUrl: { type: String, required: true }, 
  shoppingUrl: { type: String, required: true },
  addedAt: { type: Date, default: Date.now }
});

const itemModel = mongoose.models.item || mongoose.model('item', itemSchema);
export default itemModel;
