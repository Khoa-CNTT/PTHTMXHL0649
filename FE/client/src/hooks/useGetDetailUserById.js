import { useEffect, useState } from "react";
import * as UserService from "~/services/UserService";

const useGetDetailUserById = ({ reload = false, id }) => {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);

    const fetchUser = async () => {
        if (!id) return;

        setLoading(true);
        try {
            const res = await UserService.getDetailUserByUserId({ id });
            if (res?.code === 1000) {
                setUser(res?.result);
            }
        } catch (error) {
            console.error("Failed to fetch user details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchUser();
        }
    }, [id, reload]);

    return { loading, user, reload: fetchUser };
};

export default useGetDetailUserById;