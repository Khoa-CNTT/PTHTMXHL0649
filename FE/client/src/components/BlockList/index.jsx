import React, { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import { Button } from "..";
import * as UserService from "~/services/UserService";
import { BlankAvatar } from "~/assets";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { message, Spin } from "antd";
import CustomModal from "~/components/CustomModal";

const BlockList = ({ setting }) => {
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();
  const handleClose = () => setOpen(false);
  const [loadingUnblock, setLoadingUnblock] = useState(false);

  const {
    data: blocks = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["blockList"],
    queryFn: UserService.blockList,
    enabled: open,
  });

  const handleUnblock = async (id) => {
    const messageKey = "unBlock";
    setLoadingUnblock(true);
    message.loading({
      content: t("Đang bỏ chặn..."),
      key: messageKey,
    });

    try {
      const res = await UserService.unBlock(id);
      if (res?.status === "NONE") {
        await refetch();
        message.success({
          content: t("Bỏ chặn thành công"),
          key: messageKey,
        });
      }
    } finally {
      setLoadingUnblock(false);
    }
  };

  return (
    <div>
      {setting && (
        <IoIosArrowForward
          onClick={() => setOpen(true)}
          size={20}
          className="cursor-pointer text-bgStandard"
        />
      )}

      <CustomModal
        className="w-full md:w-[500px] max-w-[95vw] rounded-2xl border-1 border-borderNewFeed bg-primary flex items-center justify-center flex-col"
        isOpen={open}
        onClose={handleClose}
      >
        <div className="w-full py-4 md:py-5 px-3 md:px-5 flex items-center justify-center border-b border-borderNewFeed">
          <span className="font-bold text-ascent-1 text-center text-base md:text-lg">
            {t("Danh sách chặn")}
          </span>
        </div>

        <div
          className={`w-full overflow-x-hidden ${
            isExpanded ? "max-h-full" : "max-h-[70vh] md:max-h-96"
          } overflow-y-auto`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-5">
              <Spin />
            </div>
          ) : blocks.length > 0 ? (
            blocks.map((block) => (
              <div
                key={block?.userId}
                className="w-full py-4 md:py-6 px-3 md:px-5 flex items-center justify-between border-b border-borderNewFeed cursor-pointer hover:bg-hoverItem"
              >
                <div className="flex items-center gap-x-3 md:gap-x-5">
                  <img
                    src={block?.imageUrl ?? BlankAvatar}
                    alt="avatar"
                    className="w-8 h-8 md:w-10 md:h-10 object-cover rounded-full bg-no-repeat"
                  />
                  <span className="font-semibold text-ascent-1 text-sm md:text-base truncate max-w-[120px] md:max-w-full">
                    {block?.username}
                  </span>
                </div>
                <div className="relative">
                  <Button
                    title={t("Bỏ chặn")}
                    disable={loadingUnblock}
                    onClick={() => handleUnblock(block?.userId)}
                    className="border-1 border-borderNewFeed rounded-xl hover:bg-hoverItem px-2 md:px-3 py-1 md:py-2 text-ascent-1 text-xs md:text-sm"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-5">
              <span className="text-ascent-1 text-center text-sm">
                {t("Chưa có ai trong danh sách chặn")}
              </span>
            </div>
          )}
        </div>

        <div
          className="w-full py-3 md:py-5 border-t border-borderNewFeed rounded-b-2xl hover:bg-hoverItem cursor-pointer px-3 md:px-4 flex items-center justify-center text-blue text-xs md:text-sm font-semibold"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? t("Xem ít hơn") : t("Xem tất cả")}
        </div>
      </CustomModal>
    </div>
  );
};

export default BlockList;
