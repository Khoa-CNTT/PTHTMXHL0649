import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import * as PostService from "~/services/PostService"

const useGetMyPost = () => {
    const [posts, setPosts] = useState([])
    const user = useSelector(state => state.user)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getPosts = async () => {
            try {
                const res = await PostService.getMyPosts(user?.token)
                if (res?.code == 1401) {
                    return
                }
                setPosts(res?.result?.data)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        getPosts()
    }, [user?.token])

    return {
        posts, loading
    }
}

export default useGetMyPost