import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MdOutlineSearchOff } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";
import UserCard from "~/components/SearchResults/UserCard";
import GroupCard from "~/components/SearchResults/GroupCard";
import PostCard from "~/components/SearchResults/PostCard";

const SearchResults = ({ searchQuery, activeFilter }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState({
    posts: [],
    users: [],
    groups: [],
  });

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Simulating API calls based on the activeFilter
        // In a real app, you would make actual API calls to fetch results
        const endpoint =
          activeFilter === "all" ? "search" : `search/${activeFilter}`;

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock data for demonstration
        const mockResults = {
          posts:
            activeFilter === "all" || activeFilter === "posts"
              ? Array(5)
                  .fill()
                  .map((_, i) => ({
                    id: `post-${i}`,
                    title: `Post about ${searchQuery} #${i}`,
                    content: `This is a sample post content related to ${searchQuery}...`,
                    author: { name: `User ${i}`, avatar: "" },
                    createdAt: new Date().toISOString(),
                    likes: Math.floor(Math.random() * 100),
                    comments: Math.floor(Math.random() * 20),
                  }))
              : [],
          users:
            activeFilter === "all" || activeFilter === "users"
              ? Array(3)
                  .fill()
                  .map((_, i) => ({
                    id: `user-${i}`,
                    name: `User ${searchQuery} ${i}`,
                    avatar: "",
                    followers: Math.floor(Math.random() * 1000),
                    following: Math.floor(Math.random() * 500),
                  }))
              : [],
          groups:
            activeFilter === "all" || activeFilter === "groups"
              ? Array(2)
                  .fill()
                  .map((_, i) => ({
                    id: `group-${i}`,
                    name: `${searchQuery} Group ${i}`,
                    coverImage: "",
                    members: Math.floor(Math.random() * 1000),
                    description: `This is a group about ${searchQuery}`,
                  }))
              : [],
        };

        setResults(mockResults);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery, activeFilter]);

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="animate-spin text-blue text-3xl" />
        </div>
      );
    }

    if (!searchQuery) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <MdOutlineSearchOff className="text-gray-400 text-6xl mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            {t("Nhập từ khóa để tìm kiếm")}
          </p>
        </div>
      );
    }

    const hasResults =
      results.posts.length > 0 ||
      results.users.length > 0 ||
      results.groups.length > 0;

    if (!hasResults) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <MdOutlineSearchOff className="text-gray-400 text-6xl mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            {t("Không tìm thấy kết quả cho")} "{searchQuery}"
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4 pb-4">
        {/* Show users section */}
        {(activeFilter === "all" || activeFilter === "users") &&
          results.users.length > 0 && (
            <div className="px-4 pt-4">
              {activeFilter === "all" && (
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  {t("Người dùng")}
                </h2>
              )}
              <div className="flex flex-col gap-3">
                {results.users.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            </div>
          )}

        {/* Show groups section */}
        {(activeFilter === "all" || activeFilter === "groups") &&
          results.groups.length > 0 && (
            <div className="px-4 pt-4">
              {activeFilter === "all" && (
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  {t("Nhóm")}
                </h2>
              )}
              <div className="flex flex-col gap-3">
                {results.groups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            </div>
          )}

        {/* Show posts section */}
        {(activeFilter === "all" || activeFilter === "posts") &&
          results.posts.length > 0 && (
            <div className="px-4 pt-4">
              {activeFilter === "all" && (
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  {t("Bài viết")}
                </h2>
              )}
              <div className="flex flex-col gap-4">
                {results.posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}
      </div>
    );
  };

  return <div className="w-full">{renderResults()}</div>;
};

export default SearchResults;
