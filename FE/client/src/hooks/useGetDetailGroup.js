import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as GroupService from "~/services/GroupService";

const useGetDetailGroup = (reload = false) => {
    const [groupDetail, setGroupDetail] = useState({});
    const [loading, setLoading] = useState(true);
    const { id } = useParams();

    const fetchDetailGroup = async () => {
        setLoading(true);
        try {
            const res = await GroupService.getDetailGroup(id);
            if (res?.code === 200 && res?.result) {
                setGroupDetail(res?.result);
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetailGroup();
    }, [id, reload]);

    return { loading, groupDetail, reload: fetchDetailGroup };
};

export default useGetDetailGroup;
