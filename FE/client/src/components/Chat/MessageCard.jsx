import React from "react";

const MessageCard = ({ isReqUserMessage, content, timestamp, profilePic }) => {
  return (
    <div
      className={`flex w-full ${
        isReqUserMessage ? "justify-start" : "justify-end"
      } my-2`}
    >
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          isReqUserMessage
            ? "bg-blue-500 text-red-600"
            : "bg-gray-200 text-black"
        }`}
      >
        <p>{content}</p>
        <span className="text-xs opacity-70 block mt-1">
          {timestamp && (
            <span className="text-xs text-gray-600 mt-1">
              {new Date(timestamp).toLocaleTimeString()}
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

export default MessageCard;
