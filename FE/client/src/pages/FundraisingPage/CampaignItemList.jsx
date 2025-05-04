import React from "react";
import { useTranslation } from "react-i18next";
import { FaUser } from "react-icons/fa";

const CampaignItemList = ({ campaign }) => {
  const { t } = useTranslation();
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      key={campaign.id}
      className="flex bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Campaign Image */}
      <div className="relative h-24 w-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden mr-4">
        {campaign.image_url && campaign.image_url.length > 0 ? (
          <img
            src={campaign.image_url[0]}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
            <span className="text-indigo-300 text-2xl">📷</span>
          </div>
        )}
      </div>

      <div className="flex-grow">
        <div className="flex justify-between">
          <h3 className="font-medium text-gray-800">{campaign.title}</h3>
          <div className="flex items-center space-x-2">
            {campaign.goalReached && (
              <span className="bg-green-50 text-green-600 text-xs py-1 px-2 rounded-full">
                {t("Goal Reached")}
              </span>
            )}
            <span className="bg-gray-50 text-gray-600 text-xs py-1 px-2 rounded-full">
              {campaign.daysLeft} {t("days left")}
            </span>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-500 mt-1">
          <FaUser className="w-3 h-3 mr-1" />
          <span>{campaign.userDetails?.username || t("Unknown")}</span>
        </div>

        <div className="relative w-full h-2 bg-gray-100 rounded-full my-3">
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

        <div className="flex justify-between text-sm">
          <div>
            <span className="text-gray-500">{t("Raised")}: </span>
            <span className="font-medium text-gray-800">
              {formatCurrency(campaign.current_amount)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">{t("Goal")}: </span>
            <span className="font-medium text-gray-800">
              {formatCurrency(campaign.target_amount)}
            </span>
          </div>
          <div>
            <span className="font-medium text-indigo-600">
              {campaign.progress}% {t("Funded")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignItemList;
