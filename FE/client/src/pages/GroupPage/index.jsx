import { BlankAvatar } from "~/assets";
import { IoIosArrowDown } from "react-icons/io";
import {
  TopBar,
  FriendRequest,
  FriendSuggest,
  Welcome,
  Story,
  Group,
  CreatePost,
} from "~/components";
import GroupDesc from "~/components/GroupDesc";
import PostGroup from "~/components/PostGroup";
import { Dropdown, Space } from "antd";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import useGetDetailGroup from "~/hooks/useGetDetailGroup";
import { useParams } from "react-router-dom";
import * as GroupService from "~/services/GroupService";
import AddMemberToGroup from "~/components/AddMemberToGroup";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const GroupPage = () => {
  const token = localStorage.getItem("token");
  const { groupDetail, reload } = useGetDetailGroup();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const user = useSelector((state) => state?.user);
  const { t } = useTranslation();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState("0");

  const items = [
    {
      key: "0",
      label: t("Cho bạn"),
    },
  ];

  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
  };

  const fetchPosts = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const res = await GroupService.getAllPosts({
        id,
        token,
        page,
        size: 10,
      });

      const { code, result } = res;
      if (code === 200 && result) {
        const { data: dataPost, currentPage, totalPage } = result;

        setPosts((prev) => [...prev, ...dataPost]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPosts([]);
    setPage(1);
    fetchPosts();
  }, []);

  const handleSuccess = () => {
    setPosts([]);
    setPage(1);
    fetchPosts();
  };

  const handleSuccessAdd = () => {
    reload();
  };

  return (
    <div className="w-full lg:px-10 pb-10 2xl:px-50 bg-bgColor h-screen overflow-hidden">
      <TopBar title={groupDetail?.name} />
      <Welcome />
      <div className="w-full flex gap-2 pb-10 lg:gap-4 h-full">
        {/* Left */}
        <div className="hidden w-1/3 md:mx-2 lg:w-1/4 h-full md:flex flex-col gap-6 overflow-y-auto">
          {token && (
            <>
              <GroupDesc groupDetail={groupDetail} />
              <AddMemberToGroup groupId={id} onSuccessAdd={handleSuccessAdd} />
              <Group />
            </>
          )}
        </div>

        {/* Center */}
        <div className="flex-1 h-full mx-2 lg:m-0 flex flex-col gap-3 overflow-y-auto">
          {/* 1 */}
          <div className="w-full rounded-2xl bg-primary border-borderNewFeed shadow-newFeed border-1">
            <div className="w-full border-b p-4 border-borderNewFeed">
              <span className="font-normal text-ascent-1">
                {t("Đăng cái gì đó")}
              </span>
            </div>
            <div className="w-full flex justify-between items-center p-4 gap-x-3">
              <div className="flex items-center gap-4">
                <img
                  src={user?.avatar ?? BlankAvatar}
                  alt="User Image"
                  className="w-12 h-12 rounded-full object-cover shadow-newFeed"
                />
                <span className="text-ascent-2 text-sm cursor-pointer">
                  {t("Có gì mới ?")}
                </span>
              </div>
              <div>
                <CreatePost group groupId={id} onSuccess={handleSuccess} />
              </div>
            </div>
          </div>
          {/* 3 */}
          <div className="w-full flex gap-2 px-1 items-center">
            <div className="flex-1 border-1 border-borderNewFeed"></div>
            <div className="flex-shrink-0">
              <span className="text-sm text-ascent-2">{t("Sắp xếp")}: </span>
              <Dropdown
                className="cursor-pointer"
                menu={{
                  items,
                  selectable: true,
                  onSelect: handleMenuClick,
                }}
              >
                <Space>
                  <span className="text-sm text-ascent-1">
                    {items[selectedKey].label}
                  </span>
                  <IoIosArrowDown size={18} className="text-ascent-1" />
                </Space>
              </Dropdown>
            </div>
          </div>

          {/* 2 */}
          {posts.length > 0 ? (
            posts.map((post, i) => (
              <PostGroup key={i} post={post} onSuccess={handleSuccess} />
            ))
          ) : (
            <div className="flex w-full h-full items-center justify-center">
              <p className="text-lg text-ascent-2">
                {t("Không có bài viết nào")}
              </p>
            </div>
          )}

          {isLoading && (
            <div className="w-full h-full flex items-center justify-center">
              <CircularProgress />
            </div>
          )}

          {/* {!hasMore && (
            <div className="flex w-full h-full items-center justify-center">
              <p className="text-lg text-ascent-2">Không có bài viết nào</p>
            </div>
          )} */}
        </div>

        {/* Right */}
        <div className="hidden w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto">
          {token && (
            <>
              <Story />
              <FriendRequest />
              <FriendSuggest />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
