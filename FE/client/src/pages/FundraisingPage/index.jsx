import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FaSearch,
  FaRegCheckCircle,
  FaRegTimesCircle,
  FaPlus,
  FaUser,
  FaChevronDown,
  FaRegUserCircle,
} from "react-icons/fa";
import { BsGridFill, BsListUl } from "react-icons/bs";
import { IoDocumentOutline } from "react-icons/io5";
import {
  TopBar,
  Welcome,
  ProfileCard,
  FriendCard,
  Group,
  ProfileCardSkeleton,
  FriendCardSkeleton,
  GroupSkeleton,
  PageMeta,
} from "~/components";
import { APP_NAME } from "~/utils";
import { BlankAvatar } from "~/assets";
import * as CampaignService from "~/services/CampaignService";
import * as UserService from "~/services/UserService";
import CreateCampaign from "~/components/CreateCampaign";
import CampaignItemList from "~/pages/FundraisingPage/CampaignItemList";
import CampaignItemGrid from "~/pages/FundraisingPage/CampaignItemGrid";

const FundraisingPage = () => {
  const user = useSelector((state) => state?.user);
  const { t } = useTranslation();
  const isAuthenticated = !!user?.token;
  const [campaignData, setCampaignData] = useState([]);
  const [topCampaignData, setTopCampaignData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  const {
    data: campaignsData,
    isLoading: isLoadingCampaigns,
    refetch: refetchGetCampaign,
  } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await CampaignService.getAllCampaign();
      return res?.result || [];
    },
  });

  const {
    data: topCampaignsData,
    isLoading: isLoadingTopCampaigns,
    refetch: refetchGetTopCampaign,
  } = useQuery({
    queryKey: ["topCampaigns"],
    queryFn: async () => {
      const res = await CampaignService.getTopCampaigns();
      return res?.result || [];
    },
  });

  const fetchUserDetails = async (receiverId) => {
    const userDetails = await UserService.getDetailUserByUserId({
      id: receiverId,
    });
    return userDetails?.result || null;
  };

  // Process regular campaigns
  useEffect(() => {
    const processCampaigns = async () => {
      if (campaignsData && campaignsData.length > 0) {
        const processedCampaigns = await Promise.all(
          campaignsData.map(async (campaign) => {
            const userDetails = await fetchUserDetails(campaign.receiver_id);
            const createdDate = new Date(campaign.created_date);
            const daysActive = Math.ceil(
              (new Date() - createdDate) / (1000 * 60 * 60 * 24)
            );
            const progress =
              campaign.target_amount > 0
                ? Math.round(
                    (campaign.current_amount / campaign.target_amount) * 100
                  )
                : 0;

            return {
              ...campaign,
              userDetails,
              daysActive,
              progress,
              daysLeft: 90 - daysActive > 0 ? 90 - daysActive : 0,
              goalReached: campaign.status === "FINISHED",
              featured: progress > 50 && campaign.status === "UNFINISHED",
            };
          })
        );
        setCampaignData(processedCampaigns);
      }
    };

    processCampaigns();
  }, [campaignsData]);

  // Process top campaigns
  useEffect(() => {
    const processTopCampaigns = async () => {
      if (topCampaignsData && topCampaignsData.length > 0) {
        const processedTopCampaigns = await Promise.all(
          topCampaignsData.map(async (campaign) => {
            const userDetails = await fetchUserDetails(campaign.receiver_id);
            const createdDate = new Date(campaign.created_date);
            const daysActive = Math.ceil(
              (new Date() - createdDate) / (1000 * 60 * 60 * 24)
            );
            const progress =
              campaign.target_amount > 0
                ? Math.round(
                    (campaign.current_amount / campaign.target_amount) * 100
                  )
                : 0;

            return {
              ...campaign,
              userDetails,
              daysActive,
              progress,
              daysLeft: 90 - daysActive > 0 ? 90 - daysActive : 0,
              goalReached: campaign.status === "FINISHED",
              featured: progress > 50 && campaign.status === "UNFINISHED",
            };
          })
        );
        setTopCampaignData(processedTopCampaigns);
      }
    };

    processTopCampaigns();
  }, [topCampaignsData]);

  // Filter campaigns based on search query and active filter
  const getFilteredCampaigns = () => {
    // Determine which dataset to use based on active filter
    const dataToFilter = activeFilter === "my" ? topCampaignData : campaignData;

    return dataToFilter.filter((campaign) => {
      const matchesSearch = campaign.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      switch (activeFilter) {
        case "my": // Top campaigns
          return matchesSearch;
        case "goalReached":
          return matchesSearch && campaign.goalReached;
        case "goalUnreached":
          return (
            matchesSearch &&
            !campaign.goalReached &&
            campaign.status !== "CLOSED"
          );
        case "closed":
          return matchesSearch && campaign.status === "CLOSED";
        case "draft":
          return matchesSearch && campaign.status === "DRAFT";
        default:
          return matchesSearch;
      }
    });
  };

  const filteredCampaigns = getFilteredCampaigns();

  const renderLeftSidebar = () => (
    <div className="hidden w-1/4 lg:w-1/4 h-full md:flex flex-col gap-6 overflow-y-auto">
      {isAuthenticated ? <ProfileCard user={user} /> : <ProfileCardSkeleton />}
      {isAuthenticated ? <FriendCard /> : <FriendCardSkeleton />}
      {isAuthenticated ? <Group /> : <GroupSkeleton />}
    </div>
  );

  // Filter components
  const FilterButton = ({ id, label, icon, active }) => (
    <button
      className={`flex items-center py-2 px-3 rounded-md whitespace-nowrap transition-all ${
        active
          ? "bg-indigo-50 text-indigo-600 font-medium"
          : "text-gray-500 hover:bg-gray-100"
      }`}
      onClick={() => setActiveFilter(id)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const [openCreateCampaign, setOpenCreateCampaign] = useState(false);
  const handleCloseCreateCampaign = () => setOpenCreateCampaign(false);

  const handleSuccessCreateCampaign = () => {
    refetchGetCampaign();
    refetchGetTopCampaign();
  };

  const isLoading =
    activeFilter === "my" ? isLoadingTopCampaigns : isLoadingCampaigns;

  return (
    <div>
      <PageMeta title={t(`Gây quỹ - ${APP_NAME}`)} />

      <div className="w-full lg:px-10 pb-10 2xl:px-50 bg-bgColor h-screen overflow-hidden">
        <TopBar iconBack />
        <CreateCampaign
          open={openCreateCampaign}
          handleClose={handleCloseCreateCampaign}
          onSuccessCreateCampaign={handleSuccessCreateCampaign}
        />
        <div className="w-full flex gap-2 pb-8 lg:gap-4 h-full">
          {/* Left */}
          {renderLeftSidebar()}

          {/* Center */}
          <div className="flex-1 h-full bg-primary lg:m-0 flex overflow-y-auto rounded-3xl shadow-sm border-1 border-borderNewFeed">
            <div className="max-w-6xl mx-auto p-6 font-sans w-full">
              {/* Header with Create Button */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-ascent-1">
                    {t("Fundraising Campaigns")}
                  </h1>
                  <p className="text-ascent-2 mt-1">
                    {activeFilter === "my"
                      ? t("Featured campaigns with highest funding progress")
                      : t("Manage your fundraising activities")}
                  </p>
                </div>
                <button
                  onClick={() => setOpenCreateCampaign(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-all border-1 border-borderNewFeed"
                >
                  <FaPlus size={14} />
                  <span>{t("Create Campaign")}</span>
                </button>
              </div>

              {/* Search and Filter Bar */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search Input */}
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"
                      placeholder={t("Search campaigns...")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* View Toggle and Sort */}
                  <div className="flex items-center gap-2">
                    <div className="border rounded-md overflow-hidden flex bg-white">
                      <button
                        className={`py-2 px-3 ${
                          viewMode === "grid"
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-gray-500"
                        }`}
                        onClick={() => setViewMode("grid")}
                      >
                        <BsGridFill />
                      </button>
                      <button
                        className={`py-2 px-3 ${
                          viewMode === "list"
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-gray-500"
                        }`}
                        onClick={() => setViewMode("list")}
                      >
                        <BsListUl />
                      </button>
                    </div>
                    <div className="border rounded-md flex items-center py-2 px-3 bg-white whitespace-nowrap">
                      <span className="text-gray-600 mr-2">{t("Sort by")}</span>
                      <FaChevronDown className="text-gray-500 text-xs" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center mb-6 overflow-x-auto pb-2">
                <FilterButton
                  id="all"
                  active={activeFilter === "all"}
                  label={t("All Campaigns")}
                  icon={<span className="mr-2 text-lg">📋</span>}
                />
                <FilterButton
                  id="my"
                  active={activeFilter === "my"}
                  label={t("Top Campaigns")}
                  icon={<FaRegUserCircle size={20} className="mr-2" />}
                />
                <FilterButton
                  id="goalReached"
                  active={activeFilter === "goalReached"}
                  label={t("Goal Reached")}
                  icon={<FaRegCheckCircle className="mr-2 text-green-500" />}
                />
                <FilterButton
                  id="goalUnreached"
                  active={activeFilter === "goalUnreached"}
                  label={t("In Progress")}
                  icon={<FaRegTimesCircle className="mr-2 text-orange-500" />}
                />
                <FilterButton
                  id="closed"
                  active={activeFilter === "closed"}
                  label={t("Closed")}
                  icon={<span className="mr-2 text-gray-400">⚪</span>}
                />
              </div>

              {/* Campaigns Display */}
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <>
                  {/* Show campaign count */}
                  <div className="mb-4 text-gray-500">
                    {t("Showing")}{" "}
                    <span className="font-medium">
                      {filteredCampaigns.length}
                    </span>{" "}
                    {t("campaigns")}
                  </div>

                  {filteredCampaigns.length > 0 ? (
                    viewMode === "grid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCampaigns.map((campaign) => (
                          <CampaignItemGrid
                            key={campaign.id}
                            campaign={campaign}
                          />
                        ))}
                      </div>
                    ) : (
                      // List View
                      <div className="space-y-4">
                        {filteredCampaigns.map((campaign) => (
                          <CampaignItemList
                            key={campaign.id}
                            campaign={campaign}
                          />
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                      <div className="text-center p-8">
                        <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FaSearch className="text-indigo-300 text-xl" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                          {t("No campaigns found")}
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {t(
                            "Try adjusting your search or filter to find what you're looking for"
                          )}
                        </p>
                        <button
                          onClick={() => setOpenCreateCampaign(true)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-all"
                        >
                          {t("Create a campaign")}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundraisingPage;
