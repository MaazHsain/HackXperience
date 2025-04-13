import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    groupName: {type: String, required: true},
    members: [{type: mongoose.Schema.Types.ObjectId, ref : "user"}],
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: "user", required: true},
    invitedUsers: [{type: String}],
    createdAt: {type: Date, default: Date.now}
});

const groupModel = mongoose.models.group || mongoose.model('group', groupSchema);
export default groupModel;