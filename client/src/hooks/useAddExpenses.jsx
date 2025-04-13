import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

axios.defaults.withCredentials = true;

export const useAddExpenses = () => {
    const {backendUrl} = useContext(AppContext);
    const queryClient = useQueryClient();

    const addExpense = useMutation({
        mutationFn: async ({ groupId, paidBy, description, splitAmong, currency }) => {
            const { data } = await axios.post(backendUrl + '/api/expenses/expenses', {
                groupId,
                paidBy,
                description,
                splitAmong,
                currency
            });
            // **Ensure API response contains success: true before resolving**
            if (!data.success) {
                throw new Error(data.message || "Unknown error occurred");
            }

            return data;
        },
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: ["expenses", TbVariablePlus.groupId] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to add expense");
        }
    });

    return addExpense;
};