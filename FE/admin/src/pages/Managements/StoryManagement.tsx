import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { APP_NAME, convertToVietnamTime } from "../../utils";
import * as AdminService from "@/services/AdminService";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Image, Popconfirm, Select, Space } from "antd";
import { Search } from "lucide-react";
import StoryTable from "@/components/tables/BasicTables/StoryTable";

export default function StoryManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [postsWithAuthors, setPostsWithAuthors] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [sortOption, setSortOption] = useState("newest-created");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch posts with pagination
  const {
    data: postsResponse,
    isLoading: isLoadingPosts,
    error: postsError,
    refetch,
  } = useQuery({
    queryKey: ["posts", currentPage, pageSize],
    queryFn: async () => {
      const res = await AdminService.getAllStories({
        page: currentPage,
        size: pageSize,
      });
      return res;
    },
  });

  useEffect(() => {
    if (postsResponse?.result) {
      setPagination({
        current: postsResponse.result.currentPage,
        pageSize: postsResponse.result.pageSize,
        total: postsResponse.result.totalElement,
      });
    }
  }, [postsResponse]);

  useEffect(() => {
    const fetchAuthorsForPosts = async () => {
      if (
        !postsResponse?.result?.data ||
        postsResponse.result.data.length === 0
      )
        return;

      const postsWithUserData = await Promise.all(
        postsResponse.result.data.map(async (post) => {
          try {
            if (!post.userId) return { ...post, authorName: "Unknown User" };

            const userResponse = await AdminService.getDetailUserByUserId({
              id: post.userId,
            });
            const userData = userResponse?.result || {};

            return {
              ...post,
              authorName: userData.username || "Unknown User",
            };
          } catch (error) {
            return { ...post, authorName: "Unknown User" };
          }
        })
      );

      setPostsWithAuthors(postsWithUserData);
      applyFilterAndSort(postsWithUserData, searchText, sortOption);
    };

    if (postsResponse?.result?.data) {
      fetchAuthorsForPosts();
    }
  }, [postsResponse]);

  // Function to apply filtering and sorting
  const applyFilterAndSort = (posts, searchQuery, sortBy) => {
    if (!posts || posts.length === 0) return;

    // Apply search filter
    let filtered = posts;
    if (searchQuery) {
      const lowerCaseSearch = searchQuery.toLowerCase();
      filtered = posts.filter(
        (post) =>
          (post.authorName &&
            post.authorName.toLowerCase().includes(lowerCaseSearch)) ||
          (post.content && post.content.toLowerCase().includes(lowerCaseSearch))
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest-created":
          return new Date(b.createdDate || 0) - new Date(a.createdDate || 0);
        case "oldest-created":
          return new Date(a.createdDate || 0) - new Date(b.createdDate || 0);
        case "newest-modified":
          return new Date(b.modifiedDate || 0) - new Date(a.modifiedDate || 0);
        case "oldest-modified":
          return new Date(a.modifiedDate || 0) - new Date(b.modifiedDate || 0);
        default:
          return new Date(b.createdDate || 0) - new Date(a.createdDate || 0);
      }
    });

    setFilteredPosts(sorted);
  };

  // Re-apply filter and sort when search or sort option changes
  useEffect(() => {
    applyFilterAndSort(postsWithAuthors, searchText, sortOption);
  }, [searchText, sortOption]);

  const handleTableChange = (newPagination) => {
    // If we're filtering/searching, handle pagination locally
    if (searchText) {
      setPagination({
        ...newPagination,
        total: filteredPosts.length,
      });
    } else {
      // Otherwise use API pagination
      setCurrentPage(newPagination.current);
      setPageSize(newPagination.pageSize);
    }
  };

  const handleSearchChange = (e) => {
    const newSearchText = e.target.value;
    setSearchText(newSearchText);

    // Reset to first page when search changes
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const handleSortChange = (value) => {
    setSortOption(value);
  };

  // Get current page data for client-side pagination when filtering
  const getCurrentPageData = () => {
    if (!searchText) return filteredPosts;

    const startIndex = (pagination.current - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredPosts.slice(startIndex, endIndex);
  };

  // Update pagination total when filtered results change
  useEffect(() => {
    if (searchText) {
      setPagination((prev) => ({
        ...prev,
        total: filteredPosts.length,
      }));
    }
  }, [filteredPosts, searchText]);

  const handleDeletePost = async (postId) => {
    const res = await AdminService.deletePost(postId);
    console.log(res);
  };

  const TABLE_POSTS = [
    {
      title: "Author",
      dataIndex: "authorName",
      key: "authorName",
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
    },
    {
      title: "Image",
      dataIndex: "authorName",
      key: "authorName",
    },
    {
      title: "Posted At",
      dataIndex: "postedAt",
      key: "postedAt",
    },
    {
      title: "Expiry Time",
      dataIndex: "expiryTime",
      key: "expiryTime",
    },
    {
      title: "Visibility",
      dataIndex: "visibility",
      key: "visibility",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            placement="topLeft"
            title="Delete post"
            description="Are you sure to delete this post?"
            onConfirm={() => handleDeletePost(record?.id)}
            okText="Yes"
            cancelText="No"
          >
            <span className="text-red-800 cursor-pointer">Delete</span>
          </Popconfirm>
        </Space>
      ),
      width: 100,
    },
  ];

  return (
    <>
      <PageMeta title={`Post Management - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle="Posts" />
      <div className="space-y-6">
        <ComponentCard
          title="Posts Table"
          btn={
            <>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative w-full sm:w-auto">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search by author or content..."
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white w-full sm:w-64"
                    value={searchText}
                    onChange={handleSearchChange}
                  />
                </div>
                <Select
                  defaultValue="newest-created"
                  className="min-w-40"
                  onChange={handleSortChange}
                  options={[
                    { value: "newest-created", label: "Newest Created" },
                    { value: "oldest-created", label: "Oldest Created" },
                    { value: "newest-modified", label: "Newest Modified" },
                    { value: "oldest-modified", label: "Oldest Modified" },
                  ]}
                />
              </div>
            </>
          }
        >
          {postsError ? (
            <div className="text-red-500">Error loading posts</div>
          ) : (
            <StoryTable
              columns={TABLE_POSTS}
              data={searchText ? getCurrentPageData() : filteredPosts}
              loading={
                isLoadingPosts ||
                (postsResponse?.result?.data && postsWithAuthors.length === 0)
              }
              pagination={pagination}
              onChange={handleTableChange}
            />
          )}
        </ComponentCard>
      </div>
    </>
  );
}
