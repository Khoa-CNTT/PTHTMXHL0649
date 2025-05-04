import { useTranslation } from "react-i18next";
import { Carousel, Progress } from "antd";
import { DollarOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import * as CampaignService from "~/services/FundraisingService";
import { Button } from "~/components";
import { useEffect, useState } from "react";
import CreateCampaign from "~/components/CreateCampaign";
import SelectAmount from "~/components/SelectAmount";
import * as FundraisingService from "~/services/FundraisingService";
import { useMutationHook } from "~/hooks/useMutationHook";

const CampaignCard = () => {
  const { t } = useTranslation();
  const theme = useState((state) => state?.theme?.theme);
  const [open, setOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null); // ✨ campaign đang chọn để donate

  const handleClose = () => {
    setOpen(false);
    setSelectedCampaign(null); // reset khi đóng modal
  };

  const {
    data: campaigns,
    isLoading: isLoadingCampaigns,
    refetch: refetchGetCampaign,
  } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const res = await CampaignService.getAllCampaign();
      return res?.result || [];
    },
  });

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
    if (!selectedCampaign) return;
    const data = {
      campaign_id: selectedCampaign.id, // ✨ lấy id campaign đang chọn
      amount,
    };
    mutation.mutate(data);
  };

  const carouselSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 10000,
  };

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

  const [openCreateCampaign, setOpenCreateCampaign] = useState(false);
  const handleCloseCreateCampaign = () => setOpenCreateCampaign(false);

  const handleSuccessCreateCampaign = () => {
    refetchGetCampaign();
  };

  return (
    <div className="w-full bg-primary shadow-newFeed rounded-3xl border-1 border-borderNewFeed px-5 py-5">
      <CreateCampaign
        open={openCreateCampaign}
        handleClose={handleCloseCreateCampaign}
        onSuccessCreateCampaign={handleSuccessCreateCampaign}
      />

      <SelectAmount
        campaign={selectedCampaign} // ✨ truyền campaign đang chọn
        isOpen={open}
        onClose={handleClose}
        onDonate={handleDonate}
      />

      <div className="flex items-center justify-between text-lg text-ascent-1">
        <span>{t("Chiến dịch")}</span>
        <Button
          onClick={() => setOpenCreateCampaign(true)}
          title={t("Create campaign")}
          className="border-1 border-borderNewFeed active:scale-90 hover:scale-105 transition-transform bg-bgStandard rounded-xl py-2 px-3 text-xs text-ascent-3"
        />
      </div>

      <div className="w-full pt-4">
        <Carousel {...carouselSettings}>
          {campaigns?.length > 0 &&
            campaigns.map((campaign) => (
              <div key={campaign.id}>
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
                    onClick={() => {
                      setSelectedCampaign(campaign); // ✨ chọn campaign hiện tại
                      setOpen(true); // mở modal
                    }}
                    className="border-1 w-full bg-bgStandard border-borderNewFeed rounded-xl py-3 px-2 text-sm text-ascent-3"
                    title={t("Quyên góp ngay")}
                  />
                </div>
              </div>
            ))}
        </Carousel>
      </div>
    </div>
  );
};

export default CampaignCard;
