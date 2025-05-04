import React from "react";

const ChatCardSkeleton = () => {
  return (
    <div className="flex items-center p-4 border-b border-gray-200 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-12"></div>
    </div>
  );
};

export default ChatCardSkeleton;
