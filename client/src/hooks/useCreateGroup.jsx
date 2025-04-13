import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

axios.defaults.withCredentials = true;

export const useCreateGroup = () => {
    const {backendUrl} = useContext(AppContext);
    const queryClient = useQueryClient();

    const createGroup = useMutation({
        mutationFn: async ({ groupName, invitedMembers }) => {
            const { data } = await axios.post(backendUrl + '/api/group/create-group', {
                groupName,
                invitedUsers: invitedMembers,
            });
            return data;
        },
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: ["groups"] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to create group");
        }
    });

    return createGroup;
};