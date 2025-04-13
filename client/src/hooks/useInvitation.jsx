import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AppContext } from "../context/AppContext";
import { useContext } from 'react';
import { toast } from "react-toastify";

axios.defaults.withCredentials = true;


export const useInvitation = () => {
    const {backendUrl} = useContext(AppContext);
    const fetchGroups = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/group/invitations');
            return data.invitations;
        } catch (error){
            toast.error(error.message);
        }
    }
    return useQuery({
        queryKey: ["invitations"],
        queryFn: fetchGroups,
    });
}
