import { useEffect, useState } from "react";
import * as FriendService from "~/services/FriendService";

const useGetFriendRequest = (reload = false) => {
    const [friendRequest, setFriendRequest] = useState([])
    const [loading, setLoading] = useState(true);

    const fetchFriendRequest = async () => {
        setLoading(true);
        try {
            const res = await FriendService.getFriendRequests();
            if (res && res?.length > 0) {
                setFriendRequest(res);
            }
        } catch (error) {
            console.error("Error fetching friends details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFriendRequest();
    }, [reload]);

    return { loading, friendRequest, reload: fetchFriendRequest };
};

export default useGetFriendRequest;
