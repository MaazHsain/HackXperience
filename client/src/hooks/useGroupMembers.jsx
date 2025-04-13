import { useGroups } from "./useGroups";

export const useGroupMembers = (groupId) => {
    const { data: groups = [], isLoading, error } = useGroups();

    // Find the correct group by ID
    const group = groups.find((group) => group._id === groupId);
    const members = group ? group.members : [];

    return { members, isLoading, error };
};
