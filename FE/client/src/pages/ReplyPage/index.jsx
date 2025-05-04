import { PageMeta, PostCard, TopBar } from "~/components";
import { useParams } from "react-router-dom";
import * as PostService from "~/services/PostService";
import * as UserService from "~/services/UserService";
import { useQuery } from "@tanstack/react-query";
import CommentCard from "~/components/CommentCard";
import { useState, useMemo } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { Dropdown, Space } from "antd";
import { useTranslation } from "react-i18next";
import { APP_NAME } from "~/utils";

const ReplyPage = () => {
  const { id } = useParams();
  const [selectedKey, setSelectedKey] = useState("0");
  const { t } = useTranslation();

  const {
    isLoading,
    data: post,
    refetch: refetchPost,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => PostService.getPostById({ id }).then((res) => res?.result),
    enabled: !!id,
  });

  const { data: user } = useQuery({
    queryKey: ["user", post?.userId],
    queryFn: () =>
      UserService.getDetailUserByUserId({ id: post?.userId }).then(
        (res) => res?.result
      ),
    enabled: !!post?.userId,
  });

  const items = [
    { key: "0", label: t("Mới nhất") },
    { key: "1", label: t("Cũ nhất") },
    { key: "2", label: t("Nhiều like nhất") },
    { key: "3", label: t("Nhiều unlike nhất") },
  ];

  // Handle sorting selection
  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
  };

  // Use memoization for sorting comments
  const sortedComments = useMemo(() => {
    if (!post?.comments) return [];

    const sorted = [...post.comments];
    switch (selectedKey) {
      case "0":
        return sorted.sort(
          (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
        );
      case "1":
        return sorted.sort(
          (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
        );
      case "2":
        return sorted.sort((a, b) => b.like - a.like);
      case "3":
        return sorted.sort((a, b) => b.unlike - a.unlike);
      default:
        return sorted;
    }
  }, [selectedKey, post?.comments]);

  // Handle success callback
  const handleSuccess = () => {
    refetchPost();
  };

  return (
    <div className="w-full lg:px-10 pb-10 2xl:px-50 bg-bgColor h-screen overflow-hidden">
      <TopBar title={t("Trả lời")} iconBack />
      <PageMeta title={`${t("Trả lời")} - ${APP_NAME}`} />

      <div className="w-full flex justify-center gap-2 pb-10 lg:gap-4 h-full">
        <div className="w-[680px] h-full bg-primary mx-2 pt-2 lg:m-0 flex flex-col gap-6 overflow-y-auto rounded-tl-3xl rounded-tr-3xl shadow-newFeed border-x-[0.8px] border-y-[0.8px] border-borderNewFeed">
          {/* Post Section */}
          <div className="px-4">
            {isLoading ? (
              <div className="animate-pulse h-40 bg-gray-200 rounded-lg"></div>
            ) : (
              <PostCard post={post} onSuccess={handleSuccess} />
            )}
          </div>

          {/* Replies Section */}
          <div className="w-full flex flex-col">
            <div className="px-6">
              <span className="font-semibold text-ascent-1">
                {t("Trả lời")}
              </span>
            </div>
            <div className="w-full flex gap-2 px-1 items-center">
              <div className="flex-1 border-t border-borderNewFeed"></div>
              <div className="flex-shrink-0">
                <span className="text-sm text-ascent-2">{t("Sắp xếp")}: </span>
                <Dropdown
                  className="cursor-pointer"
                  placement="bottomRight"
                  menu={{
                    items,
                    selectedKeys: [selectedKey],
                    onClick: handleMenuClick,
                  }}
                >
                  <Space>
                    <span className="text-sm text-ascent-2">
                      {items.find((item) => item.key === selectedKey)?.label}
                    </span>
                    <IoIosArrowDown size={18} className="text-ascent-1" />
                  </Space>
                </Dropdown>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="px-4">
            {sortedComments.length === 0 && !isLoading ? (
              <div className="text-center text-ascent-2 py-4">
                {t("Chưa có trả lời nào")}
              </div>
            ) : (
              sortedComments.map((comment) => (
                <CommentCard
                  isShowImage
                  key={comment.id}
                  comment={comment}
                  postId={post?.id}
                  onSuccess={handleSuccess}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyPage;
