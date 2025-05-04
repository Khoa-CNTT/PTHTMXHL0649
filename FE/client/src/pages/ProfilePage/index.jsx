import {
  TopBar,
  CreatePost,
  UpdateUser,
  Button,
  CustomizeMenu,
  PageMeta,
  PostCardSkeleton,
  PostCard,
} from "~/components";
import { useSelector } from "react-redux";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { BlankAvatar } from "~/assets";
import { useState, useMemo, useCallback } from "react";
import { MenuItem } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import * as FriendService from "~/services/FriendService";
import * as UserService from "~/services/UserService";
import * as PostService from "~/services/PostService";
import { RiAttachment2 } from "react-icons/ri";
import useCopyToClipboard from "~/hooks/useCopyToClipboard";
import { PiDotsThreeCircleLight } from "react-icons/pi";
import { ImUserMinus } from "react-icons/im";
import { useTranslation } from "react-i18next";
import useGetDetailUserById from "~/hooks/useGetDetailUserById";
import { APP_NAME } from "~/utils";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { Divider, Popover, Select } from "antd";
import ConfirmDialog from "~/components/ConfirmDialog";
import { IoQrCodeOutline } from "react-icons/io5";
import QRProfile from "~/components/QRProfile";
import { TbCloudUpload } from "react-icons/tb";
import UploadQrCode from "~/components/UploadQrCode";

const ProfilePage = () => {
  const { t } = useTranslation();
  const theme = useSelector((state) => state.theme.theme);
  const userState = useSelector((state) => state.user);
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loadingBlockUser, setLoadingBlockUser] = useState(false);
  const [loadingBlockUserConfirm, setLoadingBlockUserConfirm] = useState(false);
  const { copyToClipboard } = useCopyToClipboard();
  const [tabValue, setTabValue] = useState(0);
  const [friendsFilter, setFriendsFilter] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openQrProfile, setOpenQrProfile] = useState(false);
  const handleCloseQrProfile = () => setOpenQrProfile(false);
  const [openUploadQr, setOpenUploadQr] = useState(false);
  const handleOpenUploadQr = () => {
    handleCloseMenu();
    setOpenUploadQr(true);
  };
  const [openConfirmBlock, setOpenConfirmBlock] = useState({
    open: false,
    id: null,
  });
  const handleCloseConfirmBlock = () => setOpenConfirmBlock({ open: false });
  const menuOpen = Boolean(anchorEl);

  // Handle menu interactions
  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleOpenConfirm = () => {
    handleCloseMenu();
    setOpenConfirm(true);
  };
  const handleCloseConfirm = () => setOpenConfirm(false);

  // Tab handling
  const handleTabChange = (_, newValue) => setTabValue(newValue);

  const {
    data: user,
    isLoading: isLoadingDetailUser,
    refetch: refetchDetailUser,
  } = useQuery({
    queryKey: ["detailUser", id],
    queryFn: async () => {
      const res = await UserService.getDetailUserByUserId({ id });
      return res?.result;
    },
    enabled: !!id,
  });

  const {
    data: listPostShares,
    isLoading: isLoadingListPostShares,
    refetch: refetchListPostShares,
  } = useQuery({
    queryKey: ["listShares"],
    queryFn: () => PostService.getListShare({ userId: id, page: 1, size: 10 }),
    enabled: !!id,
  });

  // Friend data queries
  const {
    data: dataRequestSend,
    isLoading: isLoadingSent,
    refetch: refetchRequestSend,
  } = useQuery({
    queryKey: ["requestSend"],
    queryFn: () => FriendService.getRequestSend(),
    enabled: !!id,
  });

  const {
    data: dataFriends,
    isLoading: isLoadingFriends,
    refetch: refetchFriends,
  } = useQuery({
    queryKey: ["friends", id],
    queryFn: () => FriendService.getFriendOfUser({ id }),
    enabled: !!id,
  });

  const {
    data: dataMyFriend,
    isLoading: isLoadingMyFriend,
    refetch: refetchMyFriends,
  } = useQuery({
    queryKey: ["friendsMyUser"],
    queryFn: () => FriendService.getMyFriends(),
    enabled: !!id,
  });

  const {
    data: friendRequests,
    isLoading: isLoadingFriendRequest,
    refetch: refetchFriendRequests,
  } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: () => FriendService.getFriendRequests(),
    enabled: !!id,
  });

  // User posts query
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingPosts,
    refetch: refetchPosts,
  } = useInfiniteQuery({
    queryKey: ["userPosts", id],
    queryFn: ({ pageParam = 1 }) =>
      PostService.getPostsById({ id, page: pageParam, size: 10 }).then(
        (res) => ({
          ...res.result,
          prevOffset: pageParam,
        })
      ),
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPage
        ? lastPage.currentPage + 1
        : undefined,
    enabled: !!id,
    staleTime: 0,
  });

  // Flatten posts from pagination
  const posts = useMemo(
    () =>
      postsData?.pages.reduce((acc, page) => [...acc, ...page?.data], []) || [],
    [postsData]
  );

  // Friend management functions with proper state updates
  const handleBlockUser = async () => {
    setLoadingBlockUser(true);
    try {
      const res = await UserService.block({ id });
      if (res?.status === "BLOCKED") {
        navigate("/");
      }
    } finally {
      setLoadingBlockUser(false);
    }
  };

  const handleOpenBlockUserConfirm = (id) => {
    setOpenConfirmBlock({
      open: true,
      id: id,
    });
  };

  const handleBlockUserConfirm = async () => {
    setLoadingBlockUserConfirm(true);
    try {
      const res = await UserService.block({ id: openConfirmBlock?.id });
      if (res?.status === "BLOCKED") {
        navigate("/");
      }
    } finally {
      setLoadingBlockUserConfirm(false);
    }
  };

  const handleUnfriend = useCallback(
    async (userId) => {
      try {
        const res = await FriendService.unfriend(userId);
        if (res) {
          // Invalidate all friend-related queries
          queryClient.invalidateQueries(["friendsMyUser"]);
          queryClient.invalidateQueries(["friends", id]);
          await refetchMyFriends();
          await refetchFriends();
        }
      } catch (error) {
        console.error("Error unfriending:", error);
      }
    },
    [id, queryClient, refetchMyFriends, refetchFriends]
  );

  const handleRequest = useCallback(
    async (userId) => {
      try {
        const res = await FriendService.request(userId);
        if (res?.status === "PENDING") {
          await refetchRequestSend();
        }
      } catch (error) {
        console.error("Error sending request:", error);
      }
    },
    [refetchRequestSend]
  );

  const handleCancelRequest = useCallback(
    async (userId) => {
      try {
        const res = await FriendService.cancel(userId);
        if (res?.status === "NONE") {
          await refetchRequestSend();
        }
      } catch (error) {
        console.error("Error canceling request:", error);
      }
    },
    [refetchRequestSend]
  );

  const handleAccept = useCallback(
    async (userId) => {
      try {
        const res = await FriendService.accept(userId);
        if (res?.status === "ACCEPTED") {
          // Update all related friend data
          queryClient.invalidateQueries(["friendRequests"]);
          queryClient.invalidateQueries(["friends", id]);
          queryClient.invalidateQueries(["friendsMyUser"]);
          await refetchFriendRequests();
          await refetchFriends();
          await refetchMyFriends();
        }
      } catch (error) {
        console.error("Error accepting request:", error);
      }
    },
    [id, queryClient, refetchFriendRequests, refetchFriends, refetchMyFriends]
  );

  const handleDecline = useCallback(
    async (userId) => {
      try {
        const res = await FriendService.reject(userId);
        if (res?.status === "REJECTED") {
          queryClient.invalidateQueries(["friendRequests"]);
          await refetchFriendRequests();
        }
      } catch (error) {
        console.error("Error declining request:", error);
      }
    },
    [queryClient, refetchFriendRequests]
  );

  const handleSaveUrl = () => {
    copyToClipboard(`${window.location.origin}/profile/${id}`);
    handleCloseMenu();
  };

  // Get the correct friend list based on filter
  const displayFriendsList = useMemo(() => {
    switch (friendsFilter) {
      case "all":
        return dataFriends || [];
      case "requests":
        return friendRequests || [];
      case "sent":
        return dataRequestSend || [];
      default:
        return dataFriends || [];
    }
  }, [friendsFilter, dataFriends, friendRequests, dataRequestSend]);

  // Check if there's a pending friend request
  const hasPendingRequest = useMemo(
    () => dataRequestSend?.some((request) => request?.userId === id),
    [dataRequestSend, id]
  );

  // Check if there's a friend request to accept
  const hasFriendRequest = useMemo(
    () => friendRequests?.some((request) => request?.userId === id),
    [friendRequests, id]
  );

  // Check if already friends
  const isAlreadyFriend = useMemo(
    () => dataMyFriend?.some((friend) => friend?.userId === id),
    [dataMyFriend, id]
  );

  // UI Components
  const CustomTabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ height: "screen" }}>{children}</Box>}
    </div>
  );

  const a11yProps = (index) => ({
    id: `profile-tab-${index}`,
    "aria-controls": `profile-tabpanel-${index}`,
  });

  const isLoadingFriendData =
    isLoadingSent || isLoadingFriends || isLoadingFriendRequest;

  const handleOpenQrProfile = () => {
    handleCloseMenu();
    setOpenQrProfile(true);
  };

  return (
    <>
      <PageMeta title={`${user?.username || "Profile"} - ${APP_NAME}`} />
      <div className="w-full lg:px-10 pb-10 2xl:px-50 bg-bgColor h-screen overflow-hidden">
        <TopBar title={t("Trang cá nhân")} iconBack />
        <ConfirmDialog
          open={openConfirm}
          onClose={handleCloseConfirm}
          onConfirm={handleBlockUser}
          loading={loadingBlockUser}
          title="Chặn người dùng"
          description="Bạn có chắc chắn muốn chặn người dùng này? Họ sẽ không thể tương tác với bạn nữa."
          confirmText="Chặn"
          variant="danger"
          className="w-[400px]"
        />
        <QRProfile open={openQrProfile} onClose={handleCloseQrProfile} />
        <UploadQrCode
          open={openUploadQr}
          onClose={() => setOpenUploadQr(!openUploadQr)}
        />

        <ConfirmDialog
          open={openConfirmBlock?.open}
          onClose={handleCloseConfirmBlock}
          onConfirm={handleBlockUserConfirm}
          loading={loadingBlockUserConfirm}
          title="Chặn người dùng"
          description="Bạn có chắc chắn muốn chặn người dùng này? Họ sẽ không thể tương tác với bạn nữa."
          confirmText="Chặn"
          variant="danger"
          className="w-[400px]"
        />

        <div className="w-full h-full justify-center flex">
          <div className="max-w-[680px] h-full bg-primary rounded-3xl shadow-newFeed border-x-[0.8px] border-y-[0.8px] border-borderNewFeed overflow-y-auto">
            {/* Profile header */}
            <div className="w-full h-auto flex flex-col p-10 gap-y-5">
              {/* User info */}
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-ascent-1">
                    {user?.firstName + " " + user?.lastName || "No name"}
                  </span>
                  <span className="text-md font-normal text-ascent-1">
                    {user?.username || "No name"}
                  </span>
                </div>

                <img
                  src={user?.imageUrl || BlankAvatar}
                  alt="avatar"
                  className="rounded-full bottom-1 border-borderNewFeed object-cover w-20 h-20 bg-no-repeat shadow-newFeed"
                />
              </div>

              {/* Bio */}
              <div className="flex items-center">
                <p className="text-ascent-2">
                  {user?.bio || t("Không tiểu sử")}
                </p>
              </div>

              {/* Friend count & menu */}
              <div className="flex justify-between items-center">
                <span className="text-ascent-2">
                  {dataFriends?.length || 0} {t("bạn bè")}
                </span>
                <div className="flex gap-1">
                  <PiDotsThreeCircleLight
                    onClick={handleOpenMenu}
                    className="cursor-pointer active:scale-90"
                    color={theme === "dark" ? "#fff" : "#000"}
                    size={30}
                  />
                  <CustomizeMenu
                    handleClose={handleCloseMenu}
                    anchorEl={anchorEl}
                    open={menuOpen}
                    styles={{ marginTop: "10px", width: "500px" }}
                    anchor={{ vertical: "top", horizontal: "right" }}
                  >
                    {id !== userState?.id && (
                      <MenuItem onClick={handleOpenConfirm}>
                        <div className="flex items-center justify-between w-full">
                          <span className="text-red-600">{t("Chặn")}</span>
                          <ImUserMinus color="red" />
                        </div>
                      </MenuItem>
                    )}
                    {id === userState?.id && (
                      <div>
                        <MenuItem onClick={handleOpenQrProfile}>
                          <div className="flex items-center justify-between w-full">
                            <span
                              className={`${
                                theme === "dark" ? "text-white" : "text-black"
                              }`}
                            >
                              {t("QR code")}
                            </span>
                            <IoQrCodeOutline
                              className={`${
                                theme === "dark" ? "text-white" : "text-black"
                              }`}
                            />
                          </div>
                        </MenuItem>
                        <MenuItem onClick={handleOpenUploadQr}>
                          <div className="flex items-center gap-x-3 justify-between w-full">
                            <span
                              className={`${
                                theme === "dark" ? "text-white" : "text-black"
                              }`}
                            >
                              {t("Kết nối bằng QR code")}
                            </span>
                            <TbCloudUpload
                              className={`${
                                theme === "dark" ? "text-white" : "text-black"
                              }`}
                            />
                          </div>
                        </MenuItem>
                      </div>
                    )}
                    <div className="border-t border-borderNewFeed my-1"></div>
                    <MenuItem onClick={handleSaveUrl}>
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`${
                            theme === "dark" ? "text-white" : "text-black"
                          }`}
                        >
                          {t("Sao chép")}
                        </span>
                        <RiAttachment2
                          className={`${
                            theme === "dark" ? "text-white" : "text-black"
                          }`}
                        />
                      </div>
                    </MenuItem>
                  </CustomizeMenu>
                </div>
              </div>

              {/* Action buttons (add friend/message) */}
              <div className="w-full text-center items-center justify-center flex gap-x-2">
                {userState?.id === id ? (
                  <UpdateUser profile />
                ) : isAlreadyFriend ? (
                  <>
                    <Button
                      onClick={() => handleUnfriend(user?.id)}
                      title={t("Hủy kết bạn")}
                      className="text-textStandard bg-bgStandard w-full py-2 border border-borderNewFeed rounded-xl flex items-center justify-center font-medium"
                    />
                    <Button
                      onClick={() => navigate(`/chat/${user?.id}`)}
                      title={t("Nhắn tin")}
                      className="text-ascent-1 w-full py-2 border border-borderNewFeed rounded-xl flex items-center justify-center font-medium"
                    />
                  </>
                ) : hasPendingRequest ? (
                  <Button
                    onClick={() => handleCancelRequest(user?.id)}
                    title={t("Hủy yêu cầu")}
                    className="text-danger bg-primary w-full py-2 border border-borderNewFeed rounded-xl flex items-center justify-center font-medium"
                  />
                ) : hasFriendRequest ? (
                  <>
                    <Button
                      onClick={() => handleAccept(user?.id)}
                      title={t("Chấp nhận")}
                      className="text-textStandard bg-bgStandard w-full py-2 border border-borderNewFeed rounded-xl flex items-center justify-center font-medium"
                    />
                    <Button
                      onClick={() => handleDecline(user?.id)}
                      title={t("Từ chối")}
                      className="text-danger bg-primary w-full py-2 border border-borderNewFeed rounded-xl flex items-center justify-center font-medium"
                    />
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => handleRequest(user?.id)}
                      title={t("Kết bạn")}
                      className="text-textStandard bg-bgStandard w-full py-2 border border-borderNewFeed rounded-xl flex items-center justify-center font-medium"
                    />
                    <Button
                      onClick={() => navigate(`/chat/${user?.id}`)}
                      title={t("Nhắn tin")}
                      className="text-ascent-1 w-full py-2 border border-borderNewFeed rounded-xl flex items-center justify-center font-medium"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Profile tabs */}
            <div className="flex w-full h-auto items-center justify-center">
              <Box sx={{ width: "100%" }}>
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    width: "680px",
                  }}
                >
                  <Tabs
                    sx={{
                      color: theme === "dark" ? "#fff" : "#000",
                      "& .MuiTabs-indicator": {
                        backgroundColor: theme === "dark" ? "#fff" : "#000",
                        height: "1px",
                      },
                      "& .MuiTab-root": {
                        color: theme === "dark" ? "#aaa" : "#444",
                      },
                      "& .MuiTab-root.Mui-selected": {
                        color: theme === "dark" ? "#fff" : "#000",
                      },
                    }}
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    aria-label="profile tabs"
                  >
                    <Tab label={t("Bài đăng")} {...a11yProps(0)} />
                    <Tab label={t("Bài viết chia sẻ")} {...a11yProps(1)} />
                    <Tab label={t("Bạn bè")} {...a11yProps(2)} />
                  </Tabs>
                </Box>

                {/* Posts tab */}
                <CustomTabPanel value={tabValue} index={0}>
                  <div className="w-full pb-10 h-full">
                    {/* Create post header */}
                    <div className="w-full flex items-center justify-between px-8 py-3 border-b border-borderNewFeed">
                      <div className="flex items-center justify-center gap-4">
                        <div className="w-[50px] border-1 border-borderNewFeed h-[50px] rounded-full overflow-hidden shadow-newFeed">
                          <img
                            src={user?.imageUrl || BlankAvatar}
                            alt="avatar"
                            className="w-full h-full object-cover bg-center"
                          />
                        </div>
                        <span className="text-ascent-2 text-sm font-normal">
                          {t("Có gì mới ?")}
                        </span>
                      </div>
                      <CreatePost profilePage />
                    </div>

                    {/* Posts list */}
                    <div className="flex-1 px-3 bg-primary flex flex-col gap-6 overflow-y-auto">
                      <InfiniteScroll
                        dataLength={posts?.length || 0}
                        next={fetchNextPage}
                        hasMore={hasNextPage}
                        scrollableTarget="scroll"
                        loader={
                          <div>
                            <PostCardSkeleton />
                            <PostCardSkeleton />
                          </div>
                        }
                      >
                        <div className="w-full h-full overflow-y-auto">
                          {isLoadingPosts && (
                            <>
                              <PostCardSkeleton />
                              <PostCardSkeleton />
                            </>
                          )}
                          {posts?.length > 0 ? (
                            posts.map((post) => (
                              <PostCard
                                key={post.id}
                                post={post}
                                handleRefetch={() => refetchPosts()}
                              />
                            ))
                          ) : (
                            <div className="w-full flex items-center p-5 justify-center">
                              <span className="text-center">
                                {t("Không có bài viết nào")}
                              </span>
                            </div>
                          )}
                        </div>
                      </InfiniteScroll>
                    </div>
                  </div>
                </CustomTabPanel>

                {/* Shared posts tab */}
                <CustomTabPanel value={tabValue} index={1}>
                  <div className="w-full h-60 flex items-center justify-center">
                    <p className="text-lg text-ascent-2">
                      {t("Chưa có bài viết chia sẻ")}
                    </p>
                  </div>
                </CustomTabPanel>

                {/* Friends tab */}
                <CustomTabPanel value={tabValue} index={2}>
                  <div className="w-full h-full px-6 py-3">
                    {/* Search and filter section */}
                    <div className="flex flex-col mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-ascent-1">
                          {t("Bạn bè")} ({dataFriends?.length || 0})
                        </h3>
                        <div className="flex cursor-pointer gap-2">
                          <select
                            className="py-2 px-3 cursor-pointer rounded-xl bg-bgColor border border-borderNewFeed text-ascent-1 text-sm focus:outline-none"
                            value={friendsFilter}
                            onChange={(e) => setFriendsFilter(e.target.value)}
                          >
                            {userState?.id === id ? (
                              <>
                                <option value="all" className="cursor-pointer">
                                  {t("Tất cả bạn bè")}
                                </option>
                                <option value="requests">
                                  {t("Lời mời kết bạn")}
                                </option>
                                <option value="sent">{t("Đã gửi")}</option>
                              </>
                            ) : (
                              <option value="all">{t("Tất cả bạn bè")}</option>
                            )}
                          </select>
                        </div>
                      </div>

                      {/* Search bar */}
                      <div className="relative w-full">
                        <input
                          type="text"
                          placeholder={t("Tìm kiếm bạn bè")}
                          className="w-full py-3 pl-10 pr-4 rounded-2xl bg-bgColor border border-borderNewFeed text-ascent-1 text-sm focus:outline-none"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-ascent-2"
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
                    </div>

                    {/* Friends list */}
                    <div className="w-full">
                      {isLoadingFriendData ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Array(6)
                            .fill()
                            .map((_, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 rounded-2xl bg-bgSearch animate-pulse"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-14 h-14 rounded-full bg-borderNewFeed"></div>
                                  <div className="flex flex-col gap-2">
                                    <div className="h-4 w-32 bg-borderNewFeed rounded"></div>
                                    <div className="h-3 w-20 bg-borderNewFeed rounded"></div>
                                  </div>
                                </div>
                                <div className="h-8 w-8 bg-borderNewFeed rounded-full"></div>
                              </div>
                            ))}
                        </div>
                      ) : displayFriendsList?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {displayFriendsList.map((friend) => (
                            <div
                              key={friend?.id}
                              className="bg-bgSearch border-1 border-borderNewFeed rounded-2xl p-3 transition-all hover:shadow-md"
                            >
                              <div className="flex items-center justify-between">
                                {/* Friend card content */}
                                <div
                                  className="flex items-center gap-x-3 cursor-pointer"
                                  onClick={() =>
                                    navigate(`/profile/${friend?.userId}`)
                                  }
                                >
                                  <img
                                    src={friend?.imageUrl || BlankAvatar}
                                    alt="user avatar"
                                    className="w-14 h-14 rounded-full object-cover"
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-ascent-1">
                                      {friend?.username}
                                    </span>
                                    <span className="text-xs text-ascent-2">
                                      {`${friend?.firstName || ""} ${
                                        friend?.lastName || ""
                                      }`}
                                    </span>
                                    <div className="flex items-center mt-1">
                                      <span className="text-xs text-ascent-2 bg-bgColor px-2 py-1 rounded-full">
                                        {friend?.mutualFriends
                                          ? `${friend?.mutualFriends} ${t(
                                              "bạn chung"
                                            )}`
                                          : t("Không có bạn chung")}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Action buttons based on list type */}
                                {userState?.id === id &&
                                  friendsFilter === "all" && (
                                    <Popover
                                      placement="bottomRight"
                                      trigger="click"
                                      content={
                                        <div className="flex flex-col w-32">
                                          <button
                                            onClick={() =>
                                              handleUnfriend(friend?.userId)
                                            }
                                            className="py-2 px-3 rounded-xl text-left hover:bg-hoverItem text-danger text-sm"
                                          >
                                            {t("Hủy kết bạn")}
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleOpenBlockUserConfirm(
                                                friend?.userId
                                              )
                                            }
                                            className="py-2 px-3 text-left rounded-xl hover:bg-hoverItem text-red-600 text-sm"
                                          >
                                            {t("Chặn")}
                                          </button>
                                          <button
                                            onClick={() => navigate(`/chat`)}
                                            className="py-2 px-3 text-left rounded-xl hover:bg-hoverItem text-ascent-1 text-sm"
                                          >
                                            {t("Nhắn tin")}
                                          </button>
                                        </div>
                                      }
                                    >
                                      <button className="p-2 rounded-full hover:bg-bgColor text-ascent-2">
                                        <HiOutlineDotsHorizontal size={20} />
                                      </button>
                                    </Popover>
                                  )}

                                {friendsFilter === "requests" && (
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() =>
                                        handleAccept(friend?.userId)
                                      }
                                      title={t("Chấp nhận")}
                                      className="text-textStandard bg-bgStandard px-3 py-1 text-xs rounded-full"
                                    />
                                    <Button
                                      onClick={() =>
                                        handleDecline(friend?.userId)
                                      }
                                      title={t("Từ chối")}
                                      className="text-danger bg-primary px-3 py-1 text-xs border border-borderNewFeed rounded-full"
                                    />
                                  </div>
                                )}

                                {friendsFilter === "sent" && (
                                  <Button
                                    onClick={() =>
                                      handleCancelRequest(friend?.userId)
                                    }
                                    title={t("Hủy")}
                                    className="text-danger bg-primary px-3 py-1 text-xs border border-borderNewFeed rounded-full"
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="w-full flex flex-col items-center justify-center py-10">
                          <div className="w-20 h-20 rounded-full bg-bgColor flex items-center justify-center mb-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-10 w-10 text-ascent-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                          </div>
                          <span className="text-ascent-2 text-center text-lg mb-2">
                            {friendsFilter === "all"
                              ? id === userState?.id
                                ? t("Bạn chưa có bạn bè nào")
                                : t("Người dùng này chưa có bạn bè nào")
                              : friendsFilter === "requests"
                              ? t("Không có lời mời kết bạn nào")
                              : t("Bạn chưa gửi lời mời kết bạn nào")}
                          </span>
                          <p className="text-ascent-2 text-center text-sm mb-4">
                            {friendsFilter === "all"
                              ? id === userState?.id
                                ? t("Kết nối với bạn bè để chia sẻ trải nghiệm")
                                : t(
                                    "Khuyến khích người dùng kết nối với mọi người"
                                  )
                              : friendsFilter === "requests"
                              ? t("Bạn sẽ thấy lời mời kết bạn ở đây")
                              : t("Lời mời kết bạn đã gửi sẽ hiển thị ở đây")}
                          </p>
                          {id === userState?.id && friendsFilter === "all" && (
                            <Button
                              onClick={() => navigate("/search")}
                              title={t("Tìm bạn bè")}
                              className="mt-2 px-6 py-2 bg-primary border-1 border-borderNewFeed text-ascent-1 rounded-full hover:opacity-90 transition-opacity"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CustomTabPanel>
              </Box>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
