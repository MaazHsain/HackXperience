import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AppContext } from "../context/AppContext";
import { useContext } from 'react';
import { toast } from "react-toastify";

axios.defaults.withCredentials = true;


export const useManageInvitation = () => {
    const {backendUrl} = useContext(AppContext);
    const queryClient = useQueryClient();

    // Accept Invitation API
    const acceptInvite = useMutation({
        mutationFn : async (groupId) => {
            const {data} = await axios.post(backendUrl + `/api/group/accept-invite` , { groupId });
            return data;
        },
        onSuccess: () => {
            toast.success("Invitation accepted!");
            // Refresh invitations list
            queryClient.invalidateQueries(["invitations"]);
            // Refresh groups list
            queryClient.invalidateQueries(["groups"]);
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    // Reject Invitation API
    const rejectInvite = useMutation({
        mutationFn : async (groupId) => {
            const { data } = await axios.post(backendUrl + `/api/group/reject-invite`, { groupId });
            return data;
        },
        onSuccess: () => {
            toast.success("Invitation declined.");
            // Refresh invitations list
            queryClient.invalidateQueries(["invitations"]);
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    return { acceptInvite, rejectInvite };
};
