import { Progress } from "antd";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Button } from "~/components";
import SelectAmount from "~/components/SelectAmount";
import * as FundraisingService from "~/services/FundraisingService";
import { useMutationHook } from "~/hooks/useMutationHook";

const CampaignCardItem = ({ campaign }) => {
  const { t } = useTranslation();
  const { theme } = useSelector((state) => state?.theme);
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = (current, target) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
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
      <SelectAmount
        campaign={campaign}
        isOpen={open}
        onClose={handleClose}
        onDonate={handleDonate}
      />
      <div>
        <div className="border-1 border-borderNewFeed rounded-3xl p-4 shadow">
          {campaign.image_url && campaign.image_url.length > 0 ? (
            <div className="h-48 overflow-hidden rounded-t-lg mb-4">
              <img
                src={campaign.image_url[0]}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-48 bg-gray-200 flex items-center justify-center rounded-t-lg mb-4">
              <img
                src="/donate_blank.png"
                alt="donate_blank"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h3 className="text-lg font-semibold text-ascent-1 mb-2">
            {campaign.title}
          </h3>
          <p className="text-sm text-ascent-2 mb-4 line-clamp-2">
            {campaign.description}
          </p>

          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-bgStandard">
                {formatCurrency(campaign.current_amount)}
              </span>
              <span className="text-bgStandard">
                {formatCurrency(campaign.target_amount)}
              </span>
            </div>
            <Progress
              percent={calculateProgress(
                campaign.current_amount,
                campaign.target_amount
              )}
              showInfo={false}
              strokeColor={theme === "dark" ? "#fff" : "#000"}
            />
          </div>

          <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
            <span>
              {calculateProgress(
                campaign.current_amount,
                campaign.target_amount
              )}
              % {t("đạt được")}
            </span>
            <span>
              {t("Ngày tạo")}: {formatDate(campaign.created_date)}
            </span>
          </div>

          <Button
            onClick={() => setOpen(true)}
            className="border-1 w-full bg-bgStandard border-borderNewFeed rounded-xl py-3 px-2 text-sm text-ascent-3"
            title={t("Quyên góp ngay")}
          />
        </div>
      </div>
    </>
  );
};

export default CampaignCardItem;
