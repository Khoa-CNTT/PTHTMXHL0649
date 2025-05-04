import { useEffect, useState } from "react";
import * as AdminService from "~/services/AdminService";

const useGetGroup = (reload = false) => {
    const [group, setGroup] = useState([])
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const [page, setPage] = useState(0)
    const [size, setSize] = useState(10)

    const fetchGroup = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getAllGroup({ page, size, token });
            if (res?.code === 200 && res?.result?.content?.length > 0) {
                setGroup(res?.result?.content);
            }
        } catch (error) {
            console.error("Error fetching group details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroup();
    }, [reload]);

    return { loading, group, reload: fetchGroup };
};

export default useGetGroup;





