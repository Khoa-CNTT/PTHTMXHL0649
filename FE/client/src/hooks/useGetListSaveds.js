import { useEffect, useState } from "react";
import * as PostService from "~/services/PostService";

const useGetListSaveds = (reload = false) => {
    const [saveds, setSaveds] = useState([])
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    const fetchListSaveds = async () => {
        setLoading(true);
        try {
            const res = await PostService.getSaveds(token);
            if (res?.code === 200 && res?.result?.data?.length > 0) {
                setSaveds(res?.result?.data);
            }
        } catch (error) {
            console.error("Error fetching saveds:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListSaveds();
    }, [reload]);

    return { loading, saveds, reload: fetchListSaveds };
};

export default useGetListSaveds;





