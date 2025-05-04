import { useSelector } from "react-redux";
import * as PostService from "~/services/PostService";
import {
  FriendCard,
  ProfileCard,
  PostCard,
  TopBar,
  FriendRequest,
  FriendSuggest,
  CreatePost,
  Welcome,
  Story,
  Group,
  ProfileCardSkeleton,
  FriendCardSkeleton,
  GroupSkeleton,
  PostCardSkeleton,
  PageMeta,
} from "~/components";
import StoryRow from "~/components/StoryRow";
import { BlankAvatar } from "~/assets/index";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import { APP_NAME } from "~/utils";
import PopupAI from "~/components/PopupAI";
import { useMemo, useCallback } from "react";
import StoryCardSkeleton from "~/components/Skeleton/StoryCardSkeleton";
import FriendRequestSkeleton from "~/components/Skeleton/FriendRequestSkeleton";
import FriendSuggestSkeleton from "~/components/Skeleton/FriendSuggestSkeleton";
import CampaignCard from "~/components/CampaignCard";

const HomePage = () => {
  const user = useSelector((state) => state?.user);
  const { t } = useTranslation();
  const isAuthenticated = Boolean(user?.token);
  let sentiment = useSelector((state) => state.post.sentiment);

  const fetchPosts = async ({ pageParam = 1 }) => {
    const sentimentParam = sentiment.toUpperCase();
    let res;
    if (sentimentParam === "FOR YOU") {
      // Add sort parameter to request for newest first
      res = await PostService.getAllPosts(pageParam, { sort: "newest" });
    } else {
      res = await PostService.getPostsBySentiment({
        page: pageParam,
        sentiment: sentimentParam,
        sort: "newest", // Add sort parameter
      });
    }
    return {
      ...res.result,
      prevOffset: pageParam,
    };
  };

  const { data, fetchNextPage, hasNextPage, isLoading, refetch } =
    useInfiniteQuery({
      queryKey: ["posts", sentiment],
      queryFn: fetchPosts,
      staleTime: 0,
      getNextPageParam: (lastPage) => {
        if (lastPage.currentPage >= lastPage.totalPage) {
          return undefined;
        }
        return lastPage.currentPage + 1;
      },
    });

  const handleRefetch = useCallback(
    (isCreated) => {
      if (isCreated) {
        refetch();
      }
    },
    [refetch]
  );

  // Use useMemo to sort posts by date, ensuring newest first
  const posts = useMemo(() => {
    const allPosts = data?.pages.flatMap((page) => page.data) || [];
    // Sort by createdAt date, newest first
    return allPosts.sort((a, b) => {
      return new Date(b.createdDate) - new Date(a.createdDate);
    });
  }, [data?.pages]);

  const LeftSidebar = useCallback(
    () => (
      <>
        {isAuthenticated ? <ProfileCard /> : <ProfileCardSkeleton />}
        {isAuthenticated ? <FriendCard /> : <FriendCardSkeleton />}
        {isAuthenticated ? <Group /> : <GroupSkeleton />}
      </>
    ),
    [isAuthenticated]
  );

  const CreatePostSection = useCallback(() => {
    if (!isAuthenticated) return null;

    return (
      <div className="w-full flex items-center justify-between gap-3 py-4 px-5 border-b border-borderNewFeed">
        <div className="flex items-center gap-4">
          <div className="w-[50px] h-[50px] border-1 border-borderNewFeed rounded-full overflow-hidden shadow-newFeed">
            <img
              src={user?.avatar ?? BlankAvatar}
              alt="User Image"
              className="w-full h-full object-cover bg-center"
            />
          </div>
          <span className="text-ascent-2 text-sm cursor-pointer">
            {t("Có gì mới ?")}
          </span>
        </div>
        <CreatePost homePage handleRefetch={handleRefetch} />
      </div>
    );
  }, [isAuthenticated, user?.avatar, t, handleRefetch]);

  const StorySection = useCallback(() => {
    if (!isAuthenticated) return null;
    return <StoryRow />;
  }, [isAuthenticated]);

  const PostsList = useCallback(() => {
    if (isLoading) {
      return (
        <div className="w-full flex flex-col gap-y-6">
          {Array.from({ length: 3 }, (_, index) => (
            <PostCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      );
    }

    if (!posts.length) {
      return (
        <div className="w-full h-[500px] flex items-center p-10 justify-center">
          <span className="text-center">{t("Không có bài viết nào")}</span>
        </div>
      );
    }

    return posts.map((post) => (
      <PostCard key={post.id} post={post} handleRefetch={handleRefetch} />
    ));
  }, [isLoading, posts, t, handleRefetch]);

  const RightSidebar = useCallback(() => {
    return (
      <>
        {isAuthenticated ? <CampaignCard /> : <CampaignCard />}
        {isAuthenticated ? <FriendSuggest /> : <FriendSuggestSkeleton />}
        {isAuthenticated ? <FriendRequest /> : <FriendRequestSkeleton />}
      </>
    );
  }, [isAuthenticated]);

  return (
    <div>
      <PageMeta
        title={t(`Trang chủ - ${APP_NAME}`)}
        description="Truy cập LinkVerse ngay hôm nay! Kết nối với bạn bè, khám phá nội dung thú vị và chia sẻ khoảnh khắc đáng nhớ. Đăng nhập để bắt đầu hành trình của bạn!"
      />
      <PopupAI />

      <div className="w-full lg:px-10 pb-10 2xl:px-50 bg-bgColor h-screen overflow-hidden">
        <TopBar selectPosts title={sentiment} />
        <Welcome />
        <div className="w-full flex gap-2 pb-8 lg:gap-4 h-full">
          <div className="hidden w-1/4 lg:w-1/4 h-full md:flex flex-col gap-6 overflow-y-auto">
            {user?.token && <LeftSidebar />}
          </div>

          <div
            id="scroll"
            className="flex-1 h-full bg-primary lg:m-0 flex flex-col overflow-y-auto rounded-tl-3xl rounded-tr-3xl shadow-newFeed border-x-[0.8px] border-y-[0.8px] border-borderNewFeed"
          >
            <CreatePostSection />
            <StorySection />
            <InfiniteScroll
              dataLength={posts.length}
              next={fetchNextPage}
              hasMore={hasNextPage}
              scrollableTarget="scroll"
              loader={<PostCardSkeleton />}
            >
              <div className="w-full h-full overflow-y-auto">
                <PostsList />
              </div>
            </InfiniteScroll>
          </div>

          <div className="hidden w-1/4 h-full lg:flex flex-col gap-6 overflow-y-auto">
            {user?.token && <RightSidebar />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
