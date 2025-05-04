import { useEffect, useState } from "react";
import * as FriendService from "~/services/FriendService";

const useGetFriendSuggest = (reload = false) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFriendSuggest = async () => {
        setLoading(true);
        try {
            const res = await FriendService.friendSuggesstion();
            if (res?.code === 1000 && res?.result.length > 0) {
                setUsers(res?.result);
            }
        } catch (error) {
            console.error("Error fetching friends details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFriendSuggest();
    }, [reload]);

    return { loading, users, reload: fetchFriendSuggest };
};

export default useGetFriendSuggest;