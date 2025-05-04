import moment from "moment";
import React from "react";

const ChatCard1 = ({ userImg, name, lastMessage, fullName }) => {
  const isImageUrl = (text) => {
    if (!text) return false;
    return (
      /\.(jpeg|jpg|png|webp)$/i.test(text) ||
      text.includes("imgpost") ||
      text.includes("amazonaws.com") ||
      text.includes(".s3.") ||
      text.includes("giphy.com/media")
    );
  };

  const isGif = (text) => {
    if (!text) return false;
    return /\.gif$/i.test(text) || text.includes("giphy.com/media");
  };

  return (
    <div className="flex px-3 items-center hover:bg-hoverItem rounded-3xl justify-center py-2 group cursor-pointer">
      <div className="w-[19%] flex items-center justify-center">
        <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
          <img
            className="h-full w-full object-cover"
            src={userImg}
            alt={`${name}'s profile`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "path/to/fallback/avatar.png"; // Add a fallback image path
            }}
          />
        </div>
      </div>
      <div className="w-[80%] flex flex-col justify-center gap-y-1">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold">{name}</p>
        </div>
        <div className="flex justify-between items-center">
          {isGif(lastMessage?.content) ? (
            <p className="text-ascent-2 text-sm truncate">
              Đã gửi một nhãn dán
            </p>
          ) : isImageUrl(lastMessage?.content) ? (
            <p className="text-ascent-2 text-sm truncate">Đã gửi một ảnh</p>
          ) : (
            <p className="text-ascent-2 text-sm truncate">
              {lastMessage ? lastMessage.content : fullName}
            </p>
          )}
          <div className="flex space-x-2">
            <span className="text-gray-500 text-xs">
              {lastMessage && moment(lastMessage?.timestamp).fromNow()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatCard1;
