import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AppContext } from "../context/AppContext";
import { useContext } from 'react';
import { toast } from "react-toastify";

axios.defaults.withCredentials = true;


export const useGroups = () => {
    const {backendUrl} = useContext(AppContext);
    const fetchGroups = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/group/retrieve-groups');
            return data.groups;
        } catch (error){
            toast.error(error.message);
        }
    }
    return useQuery({
        queryKey: ["groups"],
        queryFn: fetchGroups,
    });
}
