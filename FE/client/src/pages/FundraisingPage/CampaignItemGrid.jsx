import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaUser } from "react-icons/fa";
import CampaignDetailModal from "~/components/CampaignDetail";
import SelectAmount from "~/components/SelectAmount";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as FundraisingService from "~/services/FundraisingService";

const CampaignItemGrid = ({ campaign }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [openDetailCampaign, setOpenDetailCampaign] = useState(false);
  const handleCloseDetailCampaign = () => setOpenDetailCampaign(false);

  const handleClose = () => setOpen(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const mutation = useMutationHook((data) =>
    FundraisingService.createDonate(data)
  );

  const { data, isPending, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      if (data?.code === 1000 && data?.result?.payment?.vnp_url) {
        window.location.href = data.result.payment.vnp_url;
      }
    }
  }, [isSuccess]);

  const handleDonate = (amount) => {
    const data = {
      campaign_id: campaign?.id,
      amount,
    };
    mutation.mutate(data);
  };

  return (
    <>
      <CampaignDetailModal
        open={openDetailCampaign}
        onClose={handleCloseDetailCampaign}
        campaignId={campaign?.id}
      />
      <div
        key={campaign.id}
        className="rounded-xl overflow-hidden bg-primary border-1 border-borderNewFeed shadow-sm hover:shadow-md transition-shadow"
      >
        {/* Campaign Image */}
        <div className="relative h-40 bg-gray-100">
          {campaign.image_url && campaign.image_url.length > 0 ? (
            <img
              src={campaign.image_url[0]}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="/donate_blank.png"
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          )}

          {/* User badge */}
          <div className="absolute top-3 right-3 bg-white text-gray-700 text-xs py-1 px-3 rounded-full shadow-sm flex items-center">
            {campaign.userDetails?.avatar ? (
              <img
                src={campaign.userDetails?.imageUrl || "/blank-avatar.png"}
                alt="User"
                className="w-4 h-4 rounded-full mr-1"
              />
            ) : (
              <FaUser className="w-3 h-3 mr-1" />
            )}
            <span className="truncate max-w-[80px]">
              {campaign.userDetails?.username || t("Unknown")}
            </span>
          </div>

          {/* Status badges */}
          {campaign.goalReached && (
            <div className="absolute bottom-3 right-3 bg-green-50 text-green-600 text-xs py-1 px-3 rounded-full font-medium">
              🎯 {t("Goal Reached")}
            </div>
          )}
          {campaign.featured && !campaign.goalReached && (
            <div className="absolute bottom-3 right-3 bg-indigo-50 text-indigo-600 text-xs py-1 px-3 rounded-full font-medium">
              ⭐ {t("Featured")}
            </div>
          )}
        </div>

        {/* Campaign Info */}
        <div className="p-5">
          <h3 className="font-medium text-ascent-1 text-lg mb-3 line-clamp-2 h-14">
            {campaign.title}
          </h3>

          {/* Progress bar */}
          <div className="relative w-full h-2 bg-gray-100 rounded-full mb-3">
            <div
              className={`h-2 rounded-full ${
                campaign.progress >= 100
                  ? "bg-green-500"
                  : campaign.progress >= 50
                  ? "bg-indigo-500"
                  : "bg-orange-400"
              }`}
              style={{
                width: `${Math.min(campaign.progress, 100)}%`,
              }}
            ></div>
          </div>

          {/* Progress percentage */}
          <div className="flex justify-between items-center mb-4 text-sm">
            <span className="font-medium text-gray-700">
              {campaign.progress}% {t("Funded")}
            </span>
            <span className="text-gray-500">
              {campaign.daysLeft} {t("days left")}
            </span>
          </div>

          {/* Financial summary */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">{t("Raised")}</div>
              <div className="text-gray-800 font-medium">
                {formatCurrency(campaign.current_amount)}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500">{t("Goal")}</div>
              <div className="text-gray-800 font-medium">
                {formatCurrency(campaign.target_amount)}
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="w-full flex flex-col items-center justify-center gap-y-2">
            <button
              onClick={() => setOpenDetailCampaign(true)}
              className="w-full py-2 px-4 bg-primary border-1 border-borderNewFeed text-ascent-1 rounded-lg text-sm font-medium transition-colors"
              disabled={mutation.isLoading}
            >
              View detail
            </button>
            <button
              onClick={() => setOpen(true)}
              className="w-full py-2 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium border-1 border-borderNewFeed transition-colors"
              disabled={mutation.isLoading}
            >
              {mutation.isLoading ? t("Processing...") : t("Donate")}
            </button>
          </div>

          {/* Donation Modal */}
          <SelectAmount
            campaign={campaign}
            isOpen={open}
            onClose={handleClose}
            onDonate={handleDonate}
          />
        </div>
      </div>
    </>
  );
};

export default CampaignItemGrid;
