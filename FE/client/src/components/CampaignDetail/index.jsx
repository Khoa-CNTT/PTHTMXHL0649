import React, { useState } from "react";
import {
  Heart,
  Share2,
  Calendar,
  Target,
  DollarSign,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import CustomModal from "~/components/CustomModal";
import { useQuery } from "@tanstack/react-query";
import * as CampaignService from "~/services/CampaignService";

const CampaignDetailModal = ({ open, onClose, campaignId }) => {
  const { t } = useTranslation();
  const [donationAmount, setDonationAmount] = useState(100000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use React Query to fetch campaign data
  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaignDetail", campaignId],
    queryFn: () => CampaignService.getCampaignById(campaignId),
    enabled: !!campaignId && open,
  });

  const handleDonate = () => {
    setIsSubmitting(true);
    // Mock donation submission
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      // Would normally redirect to payment page here
    }, 1000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!campaign || !campaign.result) return 0;
    const { target_amount, current_amount } = campaign.result;
    if (target_amount === 0) return 0;
    return Math.round((current_amount / target_amount) * 100);
  };

  // Mock data for frontend display
  const daysLeft = 30; // Mock value
  const donorsCount = 0; // Mock value or could be fetched from another endpoint

  return (
    <CustomModal isOpen={open} onClose={onClose}>
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : campaign && campaign.result ? (
        <div className="max-h-[80vh] bg-primary overflow-y-auto">
          {/* Header with title */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              {t("Campaign Details")}
            </h2>
          </div>

          <div className="grid md:grid-cols-5 gap-6 p-6">
            {/* Left column - Image and Stats */}
            <div className="md:col-span-3 space-y-6">
              {/* Campaign Image */}
              <div className="rounded-lg overflow-hidden bg-gray-100 aspect-video">
                {campaign.result.image_url &&
                campaign.result.image_url.length > 0 ? (
                  <img
                    src={campaign.result.image_url[0]}
                    alt={campaign.result.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                    <img
                      src="/donate_blank.png"
                      alt={campaign.result.title}
                      className="max-h-full object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Campaign Title */}
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {campaign.result.title}
                </h1>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Calendar size={16} className="mr-1" />
                  <span>
                    {t("Created")}: {formatDate(campaign.result.created_date)}
                  </span>
                </div>
              </div>

              {/* Campaign Progress */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">
                    {calculateProgress()}% {t("Funded")}
                  </span>
                  <span className="text-gray-600">
                    {daysLeft} {t("days left")}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="relative w-full h-3 bg-gray-100 rounded-full">
                  <div
                    className="h-3 rounded-full bg-indigo-500"
                    style={{ width: `${Math.min(calculateProgress(), 100)}%` }}
                  ></div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-gray-500 mb-1">
                      <DollarSign size={16} className="mr-1" />
                      <span className="text-xs">{t("Raised")}</span>
                    </div>
                    <div className="text-gray-800 font-semibold">
                      {formatCurrency(campaign.result.current_amount)}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-gray-500 mb-1">
                      <Target size={16} className="mr-1" />
                      <span className="text-xs">{t("Goal")}</span>
                    </div>
                    <div className="text-gray-800 font-semibold">
                      {formatCurrency(campaign.result.target_amount)}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-gray-500 mb-1">
                      <Users size={16} className="mr-1" />
                      <span className="text-xs">{t("Donors")}</span>
                    </div>
                    <div className="text-gray-800 font-semibold">
                      {donorsCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Description */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">
                  {t("About this campaign")}
                </h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {campaign.result.description}
                </p>
              </div>
            </div>

            {/* Right column - Donation Form */}
            <div className="md:col-span-2">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  {t("Make a Donation")}
                </h3>

                {/* Donation amount select */}
                <div className="space-y-4 mb-6">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("Donation Amount")}
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {[100000, 200000, 500000, 1000000].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                          donationAmount === amount
                            ? "bg-indigo-500 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setDonationAmount(amount)}
                      >
                        {formatCurrency(amount)}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("Custom Amount")}
                    </label>
                    <input
                      type="number"
                      value={donationAmount}
                      onChange={(e) =>
                        setDonationAmount(Number(e.target.value))
                      }
                      min="10000"
                      step="10000"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Donate button */}
                <button
                  onClick={handleDonate}
                  disabled={isSubmitting || donationAmount <= 0}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:bg-indigo-300"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {t("Processing...")}
                    </div>
                  ) : (
                    t("Donate Now")
                  )}
                </button>

                {/* Share and save buttons */}
                <div className="flex justify-between mt-4">
                  <button className="flex items-center text-sm text-gray-600 hover:text-indigo-600">
                    <Share2 size={16} className="mr-1" />
                    {t("Share")}
                  </button>
                  <button className="flex items-center text-sm text-gray-600 hover:text-indigo-600">
                    <Heart size={16} className="mr-1" />
                    {t("Save")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500">
          {t("Campaign not found")}
        </div>
      )}
    </CustomModal>
  );
};

export default CampaignDetailModal;
