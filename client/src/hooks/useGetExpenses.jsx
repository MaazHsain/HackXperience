import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

axios.defaults.withCredentials = true;

export const useGetExpenses = (groupId)=>{
    const {backendUrl} = useContext(AppContext);
    const retrieveExpenses = async()=> {
        try{
            const {data} = await axios.get(`${backendUrl}/api/expenses/${groupId}/expenses`);
            return data.expenses;
        } catch (error){
            toast.error(error.message);
        }
    }
    return useQuery({
        queryKey: ['expenses', groupId],
        queryFn: retrieveExpenses,
        enabled: !!groupId,
    });
}