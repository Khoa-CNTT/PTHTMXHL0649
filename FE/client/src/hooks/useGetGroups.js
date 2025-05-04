import { useEffect, useState } from "react";
import * as GroupService from "~/services/GroupService";

const useGetGroups = (reload = false) => {
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0)
    const [size, setSize] = useState(10)

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const res = await GroupService.getAllGroup({ page, size });
            if (res.code === 200 && res?.result?.content?.length) {
                const filterGroup = res?.result?.content?.filter(
                    (group) =>
                        group?.visibility === "PUBLIC"
                );
                setGroups(filterGroup);
            }
        } catch (error) {
            console.error("Error fetching friends details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, [reload]);

    return { loading, groups, reload: fetchGroups };
};

export default useGetGroups;





