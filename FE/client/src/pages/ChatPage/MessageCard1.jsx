import React, { useState } from "react";
import { Dropdown, message } from "antd";
import { EllipsisOutlined, DeleteOutlined } from "@ant-design/icons";
import ConfirmDialog from "~/components/ConfirmDialog";
import { useSelector } from "react-redux";

const MessageCard1 = ({
  isReqUserMessage,
  content,
  timestamp,
  profilePic,
  onDelete,
  messageId,
}) => {
  const message = useSelector((state) => state?.message);
  const [openConfirmDeleteMessage, setOpenConfirmDeleteMessage] =
    useState(false);
  const handleCloseConfirmDeleteMessage = () =>
    setOpenConfirmDeleteMessage(false);
  const isLoadingDeleteMessage = message?.loadingDeleteMessage || false;
  const isImageUrl = (text) => {
    if (!text) return false;
    return (
      text.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null ||
      text.includes("imgpost") ||
      text.includes("amazonaws.com") ||
      text.includes(".s3.")
    );
  };

  const handleConfirmDeleteMessage = () => {
    if (onDelete && messageId) {
      onDelete(messageId);
    }
    handleCloseConfirmDeleteMessage();
  };

  const items = [
    {
      key: "delete",
      label: <span className="text-red-600">Xóa tin nhắn</span>,
      icon: <DeleteOutlined className="text-red-600" />,
      onClick: () => setOpenConfirmDeleteMessage(true),
    },
  ];

  return (
    <>
      <ConfirmDialog
        open={openConfirmDeleteMessage}
        onClose={handleCloseConfirmDeleteMessage}
        onConfirm={handleConfirmDeleteMessage}
        loading={isLoadingDeleteMessage}
        title="Bạn có chắc không"
        description="Đoạn tin nhắn trên sẽ bị xóa"
        confirmText="Xóa"
        variant="danger"
        className="w-[300px]"
      />

      <div
        className={`flex w-full ${
          isReqUserMessage ? "justify-start" : "justify-end"
        } my-2`}
      >
        {isReqUserMessage && profilePic && (
          <div className="flex-shrink-0 mr-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img
                src={profilePic}
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
        <div
          className={`max-w-xs px-4 py-2 rounded-2xl relative ${
            isReqUserMessage
              ? "bg-message-1 text-ascent-1 rounded-tl-none"
              : "bg-message-2 border border-borderNewFeed text-ascent-3 rounded-tr-none"
          }`}
        >
          {isImageUrl(content) ? (
            <div className="message-image-container">
              <img
                src={content}
                alt="Message attachment"
                className="rounded-lg max-w-full max-h-60 object-contain"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                }}
              />
            </div>
          ) : (
            <p>{content}</p>
          )}
          {timestamp && (
            <span className="mt-1 text-xs text-gray-500 block">
              {new Date(timestamp).toLocaleTimeString()}
            </span>
          )}

          {!isReqUserMessage && (
            <Dropdown
              menu={{ items }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <EllipsisOutlined
                className="absolute top-2 right-2 text-gray-500 cursor-pointer hover:text-gray-700"
                style={{ fontSize: "16px" }}
              />
            </Dropdown>
          )}
        </div>
        {!isReqUserMessage && profilePic && (
          <div className="flex-shrink-0 ml-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img
                src={profilePic}
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MessageCard1;
