import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import { useState } from "react";
import { PostCardSkeleton, TopBar } from "~/components";
import PopupAI from "~/components/PopupAI";
import SavedCard from "~/components/SavedCard";
import * as PostService from "~/services/PostService";
import ConfirmDialog from "~/components/ConfirmDialog";

const SavedsPage = () => {
  const { t } = useTranslation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSaveds = async ({ pageParam = 1 }) => {
    let res = await PostService.getSaveds({
      page: pageParam,
      size: 10,
      query: searchQuery,
    });
    return {
      ...res.result,
      prevOffset: pageParam,
    };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    refetch,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["saveds", searchQuery],
    queryFn: fetchSaveds,
    staleTime: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage >= lastPage.totalPage) {
        return undefined;
      }
      return lastPage.currentPage + 1;
    },
  });

  const posts = data?.pages.reduce((acc, page) => {
    return [...acc, ...page.data];
  }, []);

  const onSuccess = () => {
    refetch();
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="w-full lg:px-10 pb-10 2xl:px-50 bg-bgColor h-screen overflow-hidden">
      <TopBar
        title={t("Saved")}
        iconBack
        rightIcon={
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        }
      />

      <div className="w-full h-full flex justify-center">
        <div className="w-[680px] h-full bg-primary lg:m-0 flex flex-col overflow-hidden rounded-tl-3xl rounded-tr-3xl shadow-newFeed border-x-[0.8px] border-y-[0.8px] border-borderNewFeed">
          {isFilterOpen && (
            <div className="p-4 border-b border-borderNewFeed bg-gray-50">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t("Search saved posts...")}
                  className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          )}

          <div id="scroll" className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex flex-col gap-6 p-4">
                <PostCardSkeleton />
                <PostCardSkeleton />
              </div>
            ) : posts?.length > 0 ? (
              <InfiniteScroll
                dataLength={posts ? posts.length : 0}
                next={fetchNextPage}
                hasMore={hasNextPage}
                loader={
                  <div className="p-4">
                    <PostCardSkeleton />
                  </div>
                }
                endMessage={
                  <div className="text-center p-4 text-gray-500">
                    {t("You've seen all your saved posts")}
                  </div>
                }
                scrollableTarget="scroll"
              >
                <div className="p-4 space-y-6">
                  {posts.map((post) => (
                    <SavedCard
                      onSuccess={onSuccess}
                      key={post.id}
                      post={post}
                    />
                  ))}
                </div>
              </InfiniteScroll>
            ) : (
              <div className="flex items-center justify-center w-full h-full p-6">
                <div className="text-center max-w-sm">
                  <div className="flex justify-center mb-6">
                    <div className="bg-gray-100 p-4 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-medium text-gray-700 mb-3">
                    {t("No saved posts yet")}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {t(
                      "When you save posts, they will appear here for you to access later."
                    )}
                  </p>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg transition-colors">
                    {t("Explore Content")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {posts?.length > 0 && (
            <div className="fixed right-6 bottom-6">
              <PopupAI />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedsPage;
