import groupModel from "../models/groupModel.js";
import userModel from "../models/userModel.js";

export const createGroup = async (req, res) => {
    try {
        const {userId, groupName, invitedUsers} = req.body;
        if (!userId || !groupName) {
            return res.json({ success: false, message: 'Missing Details'});
        }
        // check if emailProvided in invitedUsers are valid
        const existingUsers = await userModel.find({email: {$in: invitedUsers}});
        const existingUserEmails = existingUsers.map(user => user.email);

        const nonExistingUsersEmail = invitedUsers.filter(email => !existingUserEmails.includes(email));

        const group = new groupModel({
            groupName,
            createdBy: userId,
            members: [userId],
            invitedUsers: existingUserEmails
        })

        await group.save();

        let successMessage = "Group created successfully! Invitations sent to existing users."
        if (nonExistingUsersEmail.length > 0) {
            successMessage += ` The following users do not exist and were not invited: ${nonExistingUsersEmail.join(", ")}.`;
        }

        return res.json({
            success: true,
            message: successMessage
        });
    } catch (error){
        return res.json({success: false, message: error.message})
    }
}

export const invitations = async(req, res) => {
    try {
        // get userId from middleware
        const {userId} = req.body;
        // check if user is valid
        const user = await userModel.findById(userId);
        if (!user){
            return res.json({success: false, message: 'User not found'})
        }
        // find user email from user id
        const userEmail = user.email;
        // get all groups user is invited to
        const pendingInvites = await groupModel.find({invitedUsers: userEmail});

        return res.json({success: true, invitations: pendingInvites});
    } catch (error){
        return res.json({success:false, message: error.message});
    }
}

export const acceptInvitation = async(req, res) => {
    try {
        const { userId, groupId } = req.body;
        if(!groupId || !userId){
            return res.json({success: false, message: 'Information not provided'})
        }
        // check if groupId exist
        const group = await groupModel.findById(groupId);
        if (!group){
            return res.json({success: false, message: 'Group not found'})
        }
        // check if user is valid
        const user = await userModel.findById(userId);
        if (!user){
            return res.json({success: false, message: 'User not found'});
        }
        // find user email from user id
        const userEmail = user.email;
        // add user to members of group, remove from invitedUsers
        group.members.push(userId);
        group.invitedUsers = group.invitedUsers.filter(email => email.toString() != userEmail);
        await group.save();

        res.json({ success: true, message: "Invitation accepted" });
    } catch (error){
        return res.json({success:false, message: error.message});
    }
}

export const declineInvitation = async(req, res) => {
    try {
        const { userId, groupId } = req.body;
        if(!groupId || !userId){
            return res.json({success: false, message: 'Information not provided'})
        }
        // check if groupId exist
        const group = await groupModel.findById(groupId);
        if (!group){
            return res.json({success: false, message: 'Group not found'})
        }
        // check if user is valid
        const user = await userModel.findById(userId);
        if (!user){
            return res.json({success: false, message: 'User not found'});
        }
        // find user email from user id
        const userEmail = user.email;
        group.invitedUsers = group.invitedUsers.filter(email => email.toString() != userEmail);
        await group.save();

        res.json({ success: true, message: "Invitation rejected" });
    } catch (error){
        return res.json({success:false, message: error.message});
    }
}

export const retrieveGroups = async(req, res) => {
    try {
        const {userId} = req.body;
        if(!userId){
            return res.json({success: false, message: 'User not provided'})
        }
        // check if user is valid
        const user = await userModel.findById(userId);
        if (!user){
            return res.json({success: false, message: 'User not found'});
        }
        // get all groups that user is member of
        const userGroups = await groupModel.find({members : userId}).populate("members", "name");
        return res.json({success: true, groups: userGroups})
    } catch (error){
        return res.json({success:false, message: error.message});
    }
}

export const getAllMembers = async(req, res) => {
    try {
        const group = await groupModel.findById(req.params.groupId).populate("members", "name birthdate");
        if (!group) return res.json({ success: false, message: "Group not found" });
    
        res.json({ success: true, members: group.members });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

export const inviteMembers = async (req, res) => {
    try {
      const { groupId, invitedUsers } = req.body;
  
      if (!groupId || !Array.isArray(invitedUsers) || invitedUsers.length === 0) {
        return res.json({ success: false, message: "Group ID and invited users are required." });
      }
  
      // Ensure that group exist
      const group = await groupModel.findById(groupId);
      if (!group) {
        return res.json({ success: false, message: "Group not found." });
      }
  
      // Fetch users that exist
      const existingUsers = await userModel.find({ email: { $in: invitedUsers } });
      const existingUserEmails = existingUsers.map((user) => user.email);
      const nonExistingEmails = invitedUsers.filter((email) => !existingUserEmails.includes(email));
  
      // Prevent duplicates in invitedUsers or members
      const filteredInvites = existingUserEmails.filter(
        (email) =>
          !group.invitedUsers.includes(email) &&
          !group.members.some((memberId) => existingUsers.find((u) => u.email === email)?.id === memberId.toString())
      );
  
      group.invitedUsers.push(...filteredInvites);
      await group.save();
  
      let message = `Invites sent to: ${filteredInvites.join(", ")}`;
      if (nonExistingEmails.length > 0) {
        message += `. These emails do not belong to registered users: ${nonExistingEmails.join(", ")}`;
      }
  
      return res.json({success: true, message});
    } catch (error) {
      console.error("Invite Members Error:", error.message);
      return res.status(500).json({ success: false, message: "Server error." });
    }
  };
