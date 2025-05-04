import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { PageMeta, TopBar } from "~/components";
import SearchUserResult from "~/pages/SearchPage/SearchUserResult";
import { FiSearch, FiUsers, FiFileText } from "react-icons/fi";
import * as FriendService from "~/services/FriendService";
import * as SearchService from "~/services/SearchService";
import { APP_NAME } from "~/utils";
import {
  Input,
  Tabs,
  Spin,
  Empty,
  Button,
  Avatar,
  List,
  Card,
  Tag,
  Grid,
} from "antd";
import PopupAI from "~/components/PopupAI";
import { RiHashtag } from "react-icons/ri";
import { HiUserGroup } from "react-icons/hi";
import { useDebounceHook } from "~/hooks/useDebounceHook";
import { BlankAvatar } from "~/assets";

const { useBreakpoint } = Grid;

const SearchPage = () => {
  const { t } = useTranslation();
  const { state } = useLocation();
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const isMobile = !screens.sm;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [userSuggestion, setUserSuggestion] = useState([]);
  const [searchResults, setSearchResults] = useState({
    users: [],
    posts: [],
    groups: [],
    hashtags: [],
    keywords: [],
  });

  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isSearchingPosts, setIsSearchingPosts] = useState(false);
  const [isSearchingGroups, setIsSearchingGroups] = useState(false);
  const [isSearchingHashtags, setIsSearchingHashtags] = useState(false);
  const [isSearchingKeywords, setIsSearchingKeywords] = useState(false);

  const debouncedSearchQuery = useDebounceHook(searchQuery, 500);

  const { isLoading: loadingSuggestions } = useQuery({
    queryKey: ["friend-suggestion"],
    queryFn: async () => {
      const res = await FriendService.friendSuggesstion();
      setUserSuggestion(res?.result || []);
      return res?.result;
    },
  });

  // Search users
  const searchUsers = async (query) => {
    if (!query.trim()) return [];

    setIsSearchingUsers(true);
    try {
      const usersRes = await SearchService.searchUser({ keyword: query });
      setSearchResults((prev) => ({
        ...prev,
        users: usersRes?.result?.items || [],
      }));
      return usersRes?.result?.items || [];
    } catch (error) {
      console.error("User search error:", error);
      return [];
    } finally {
      setIsSearchingUsers(false);
    }
  };

  // Search posts
  const searchPosts = async (query) => {
    if (!query.trim()) return [];

    setIsSearchingPosts(true);
    try {
      const postsRes = await SearchService.searchPost({ keyword: query });
      setSearchResults((prev) => ({
        ...prev,
        posts: postsRes?.result?.data || [],
      }));
      return postsRes?.result?.data || [];
    } catch (error) {
      console.error("Post search error:", error);
      return [];
    } finally {
      setIsSearchingPosts(false);
    }
  };

  // Search groups
  const searchGroups = async (query) => {
    if (!query.trim()) return [];

    setIsSearchingGroups(true);
    try {
      const groupsRes = await SearchService.searchGroups({ keyword: query });
      setSearchResults((prev) => ({
        ...prev,
        groups: groupsRes?.result?.content || [],
      }));
      return groupsRes?.result?.content || [];
    } catch (error) {
      console.error("Group search error:", error);
      return [];
    } finally {
      setIsSearchingGroups(false);
    }
  };

  // Search keywords
  const searchKeywords = async (query) => {
    if (!query.trim()) return [];

    setIsSearchingKeywords(true);
    try {
      const keywordsRes = await SearchService.searchPostByKeyword({
        keyword: query,
      });
      setSearchResults((prev) => ({
        ...prev,
        keywords: keywordsRes?.result?.data || [],
      }));
      return keywordsRes?.result?.data || [];
    } catch (error) {
      console.error("Keyword search error:", error);
      return [];
    } finally {
      setIsSearchingKeywords(false);
    }
  };

  // Search hashtags
  const searchHashtags = async (query) => {
    if (!query.trim()) return [];

    setIsSearchingHashtags(true);
    try {
      const hashtagsRes = await SearchService.searchPostByHashTag({
        keyword: query,
      });
      const hashtags =
        hashtagsRes?.message === "Hashtag not found"
          ? []
          : hashtagsRes?.result || [];
      setSearchResults((prev) => ({
        ...prev,
        hashtags,
      }));
      return hashtags;
    } catch (error) {
      console.error("Hashtag search error:", error);
      return [];
    } finally {
      setIsSearchingHashtags(false);
    }
  };

  // Handle tab change - FIXED: removed redundant search calls
  const handleTabChange = (key) => {
    setActiveTab(key);
    // Remove the redundant search calls here since they'll be handled by the useEffect
  };

  const handleInputChange = (e) => setSearchQuery(e.target.value);

  // Effect for handling search based on debounced query
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      setSearchResults({
        users: [],
        posts: [],
        groups: [],
        hashtags: [],
        keywords: [],
      });
      return;
    }

    // For "all" tab, only search users and posts
    const performSearch = async () => {
      if (activeTab === "all" || activeTab === "users") {
        await searchUsers(debouncedSearchQuery);
      }

      if (activeTab === "all" || activeTab === "posts") {
        await searchPosts(debouncedSearchQuery);
      }

      // For other tabs, only search when that specific tab is active
      if (activeTab === "groups") {
        await searchGroups(debouncedSearchQuery);
      }

      if (activeTab === "hashtags") {
        await searchHashtags(debouncedSearchQuery);
      }

      if (activeTab === "keywords") {
        await searchKeywords(debouncedSearchQuery);
      }
    };

    performSearch();
  }, [debouncedSearchQuery, activeTab]);

  // Set initial search query from state if available
  useEffect(() => {
    if (state?.stateKeyword) {
      setSearchQuery(state.stateKeyword);
    }
  }, [state]);

  // Determine if a tab is loading
  const isTabLoading = (tab) => {
    switch (tab) {
      case "users":
        return isSearchingUsers;
      case "posts":
        return isSearchingPosts;
      case "groups":
        return isSearchingGroups;
      case "hashtags":
        return isSearchingHashtags;
      case "keywords":
        return isSearchingKeywords;
      case "all":
        return isSearchingUsers || isSearchingPosts;
      default:
        return false;
    }
  };

  // FIXED: Adjusted tab label classes for mobile responsiveness
  const getTabLabelStyles = () => {
    return isMobile ? "text-xs px-1" : "text-sm px-2";
  };

  const tabItems = [
    {
      key: "all",
      label: (
        <span
          className={`flex text-ascent-1 items-center justify-center ${getTabLabelStyles()}`}
        >
          {t("Tất cả")}
        </span>
      ),
      children: (
        <div className="p-4 pb-10">
          {isTabLoading("all") ? (
            <div className="flex justify-center px-10">
              <Spin size="large" />
            </div>
          ) : searchQuery ? (
            <>
              {/* Users section */}
              {searchResults.users.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between px-4 items-center mb-3">
                    <h3 className="text-lg font-medium text-ascent-1">
                      {t("Người dùng")}
                    </h3>
                    {searchResults.users.length > 2 && (
                      <Button
                        className="text-ascent-1"
                        type="link"
                        onClick={() => setActiveTab("users")}
                      >
                        {t("Xem tất cả")}
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {searchResults.users.slice(0, 3).map((user) => (
                      <SearchUserResult key={user.id} user={user} />
                    ))}
                  </div>
                </div>
              )}

              {/* Posts section */}
              {searchResults.posts.length > 0 && (
                <div className="mb-6 px-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-ascent-1">
                      {t("Bài viết")}
                    </h3>
                    {searchResults.posts.length > 2 && (
                      <Button
                        className="text-ascent-1"
                        type="link"
                        onClick={() => setActiveTab("posts")}
                      >
                        {t("Xem tất cả")}
                      </Button>
                    )}
                  </div>
                  <List
                    dataSource={searchResults.posts.slice(0, 2)}
                    renderItem={(post) => (
                      <Card
                        onClick={() => navigate(`/post/${post.id}`)}
                        className="mb-3 rounded-2xl bg-primary border-1 border-borderNewFeed"
                        hoverable
                      >
                        <div className="flex items-center mb-2">
                          <Avatar src={BlankAvatar} className="w-10 h-10" />
                          <div className="ml-2">
                            <p className="font-medium text-ascent-1">dhtuan</p>
                            <p className="text-xs text-ascent-2">Ha Tuan</p>
                          </div>
                        </div>
                        <p className="line-clamp-2 text-ascent-1">
                          {post.content}
                        </p>
                        {post.media && post.media.length > 0 && (
                          <div className="mt-2">
                            <img
                              src={post.media[0].url}
                              alt="Post media"
                              className="rounded-lg w-full h-32 object-cover"
                            />
                          </div>
                        )}
                      </Card>
                    )}
                  />
                </div>
              )}

              {!searchResults.users.length && !searchResults.posts.length && (
                <Empty description={t("No results found")} className="py-10" />
              )}
            </>
          ) : (
            <Empty
              description={t(
                "Nhập một từ khóa tìm kiếm để tìm người dùng, bài đăng, nhóm và nhiều hơn nữa"
              )}
              className="py-10 text-ascent-1"
            />
          )}
        </div>
      ),
    },
    {
      key: "users",
      label: (
        <span
          className={`flex items-center text-ascent-1 gap-x-1 justify-center ${getTabLabelStyles()}`}
        >
          {t("Người dùng")}
        </span>
      ),
      children: (
        <div className="p-4 pb-10">
          {isSearchingUsers ? (
            <div className="flex justify-center p-10">
              <Spin size="large" />
            </div>
          ) : searchResults.users.length > 0 ? (
            <div className="space-y-3">
              {searchResults.users.map((user) => (
                <SearchUserResult key={user.id} user={user} />
              ))}
            </div>
          ) : (
            <Empty
              description={
                searchQuery
                  ? t("Không tìm thấy người dùng nào")
                  : t("Tìm kiếm người dùng")
              }
              className="py-10"
            />
          )}
        </div>
      ),
    },
    {
      key: "posts",
      label: (
        <span
          className={`flex text-ascent-1 items-center gap-x-1 justify-center ${getTabLabelStyles()}`}
        >
          {t("Bài viết")}
        </span>
      ),
      children: (
        <div className={`p-4 pb-10 ${isMobile ? "px-2" : ""}`}>
          {isSearchingPosts ? (
            <div className="flex justify-center p-10">
              <Spin size="large" />
            </div>
          ) : searchResults.posts.length > 0 ? (
            <List
              dataSource={searchResults.posts}
              renderItem={(post) => (
                <Card
                  className={`mb-3 rounded-2xl border-1 border-borderNewFeed bg-primary ${
                    isMobile ? "mx-1" : ""
                  }`}
                  hoverable
                >
                  <div className="flex items-center mb-2">
                    <Avatar src={BlankAvatar} />
                    <div className="ml-2">
                      <p
                        className={`font-medium text-ascent-1 ${
                          isMobile ? "text-sm" : ""
                        }`}
                      >
                        dhtuan
                      </p>
                      <p className="text-xs text-ascent-2">Ha Tuan</p>
                    </div>
                  </div>
                  <p
                    className={`mb-2 text-ascent-1 ${
                      isMobile ? "text-sm" : ""
                    }`}
                  >
                    {post.content}
                  </p>
                  {post.media && post.media.length > 0 && (
                    <div className="mt-2">
                      <img
                        src={post.media[0].url}
                        alt="Post media"
                        className={`rounded-lg w-full object-cover ${
                          isMobile ? "h-36" : "h-48"
                        }`}
                      />
                    </div>
                  )}
                </Card>
              )}
            />
          ) : (
            <Empty
              description={
                searchQuery ? t("No posts found") : t("Search for posts")
              }
              className="py-10"
            />
          )}
        </div>
      ),
    },
    {
      key: "groups",
      label: (
        <span
          className={`flex text-ascent-1 items-center gap-x-1 justify-center ${getTabLabelStyles()}`}
        >
          {t("Nhóm")}
        </span>
      ),
      children: (
        <div className="p-4 pb-10">
          {isSearchingGroups ? (
            <div className="flex justify-center p-10">
              <Spin size="large" />
            </div>
          ) : searchResults.groups.length > 0 ? (
            <List
              grid={{
                gutter: 16,
                column: isMobile ? 1 : 2,
                xs: 1,
                sm: 2,
                md: 2,
                lg: 2,
              }}
              dataSource={searchResults.groups}
              renderItem={(group) => (
                <List.Item>
                  <Card
                    hoverable
                    cover={
                      group.cover && (
                        <img
                          alt={group.name}
                          src={group.cover}
                          className={`object-cover ${
                            isMobile ? "h-24" : "h-32"
                          }`}
                        />
                      )
                    }
                  >
                    <Card.Meta
                      avatar={<Avatar icon={<HiUserGroup />} />}
                      title={
                        <span className={isMobile ? "text-sm" : ""}>
                          {group.name}
                        </span>
                      }
                      description={`${group.memberCount} ${t("members")}`}
                    />
                    {group.description && (
                      <p
                        className={`mt-2 line-clamp-2 ${
                          isMobile ? "text-xs" : "text-sm"
                        }`}
                      >
                        {group.description}
                      </p>
                    )}
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <Empty
              description={
                searchQuery
                  ? t("Không tìm thấy nhóm nào")
                  : t("Search for groups")
              }
              className="py-10"
            />
          )}
        </div>
      ),
    },
    {
      key: "hashtags",
      label: (
        <span
          className={`flex text-ascent-1 items-center gap-x-1 justify-center ${getTabLabelStyles()}`}
        >
          {t("Hashtag")}
        </span>
      ),
      children: (
        <div className="p-4 pb-10">
          {isSearchingHashtags ? (
            <div className="flex justify-center p-10">
              <Spin size="large" />
            </div>
          ) : searchResults.hashtags.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={searchResults.hashtags}
              renderItem={(hashtag) => (
                <List.Item className="cursor-pointer hover:bg-gray-50 rounded-lg p-2">
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<RiHashtag />}
                        style={{ background: "#1890ff" }}
                      />
                    }
                    title={hashtag.name}
                    description={`${hashtag.postCount} ${t("posts")}`}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              description={
                searchQuery
                  ? t("Không tìm thấy hashtag nào")
                  : t("Tìm kiếm hashtag")
              }
              className="py-10"
            />
          )}
        </div>
      ),
    },
    {
      key: "keywords",
      label: (
        <span
          className={`flex text-ascent-1 items-center gap-x-1 justify-center ${getTabLabelStyles()}`}
        >
          {t("Từ khóa")}
        </span>
      ),
      children: (
        <div className="p-4 pb-10">
          {isSearchingKeywords ? (
            <div className="flex justify-center p-10">
              <Spin size="large" />
            </div>
          ) : searchResults.keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {searchResults.keywords.map((keyword, index) => (
                <Tag
                  key={index}
                  className={`cursor-pointer ${
                    isMobile ? "px-2 py-1 text-sm" : "px-3 py-2 text-base"
                  }`}
                  color="blue"
                >
                  {keyword.text}
                </Tag>
              ))}
            </div>
          ) : (
            <Empty
              description={
                searchQuery
                  ? t("Không tìm thấy từ khóa nào")
                  : t("Tìm kiếm từ khóa")
              }
              className="py-10"
            />
          )}
        </div>
      ),
    },
    {
      key: "suggestions",
      label: (
        <span
          className={`flex text-ascent-1 items-center gap-x-1 justify-center ${getTabLabelStyles()}`}
        >
          {t("Đề xuất")}
        </span>
      ),
      children: (
        <div className="px-4 pb-10">
          {loadingSuggestions ? (
            <div className="flex justify-center p-10">
              <Spin size="large" />
            </div>
          ) : userSuggestion.length > 0 ? (
            <div className="flex flex-col gap-y-4">
              {userSuggestion.map((user) => (
                <SearchUserResult key={user.id} user={user} />
              ))}
            </div>
          ) : (
            <Empty description={t("Không có đề xuất nào")} className="py-10" />
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageMeta title={t(`Tìm kiếm - ${APP_NAME}`)} />
      <div className="w-full lg:px-10 pb-10 2xl:px-50 bg-bgColor h-screen overflow-hidden">
        <TopBar title={t("Tìm kiếm")} iconBack />
        <PopupAI />

        <div className="w-full h-full justify-center flex">
          {/* Center */}
          <div className="max-w-[680px] w-full flex flex-col h-full bg-primary rounded-3xl shadow-newFeed border-x-[0.8px] border-y-[0.8px] border-borderNewFeed overflow-y-auto">
            <div className="px-5 pt-5">
              <Input
                className="w-full focus:bg-red-500 outline-none text-black flex rounded-2xl px-6 py-3 bg-primary border-1 border-borderNewFeed items-center justify-center text-base"
                placeholder={t("Tìm kiếm")}
                prefix={<FiSearch className="text-ascent-2 mr-1" size={19} />}
                value={searchQuery}
                onChange={handleInputChange}
              />
            </div>

            <Tabs
              items={tabItems}
              activeKey={activeTab}
              onChange={handleTabChange}
              tabPosition="top"
              tabBarGutter={0}
              centered
              size={isMobile ? "small" : "middle"}
              tabBarStyle={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                overflowX: "auto",
                scrollbarWidth: "none", // Hide scrollbar for Firefox
                msOverflowStyle: "none", // Hide scrollbar for IE/Edge
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPage;
