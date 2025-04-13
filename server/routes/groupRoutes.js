import express from 'express'
import userAuth from '../middleware/userAuth.js';
import { acceptInvitation, createGroup, declineInvitation, getAllMembers, invitations, inviteMembers, retrieveGroups } from '../controllers/groupController.js';

const groupRouter = express.Router();

groupRouter.post('/create-group', userAuth, createGroup);
groupRouter.get("/:groupId/members", userAuth, getAllMembers);
groupRouter.get('/invitations', userAuth, invitations);
groupRouter.post('/accept-invite', userAuth, acceptInvitation);
groupRouter.post('/reject-invitation', userAuth, declineInvitation);
groupRouter.get('/retrieve-groups', userAuth, retrieveGroups);
groupRouter.post('/invite', userAuth, inviteMembers);

export default groupRouter;