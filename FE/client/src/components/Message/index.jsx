import React from "react";
import { GoDotFill } from "react-icons/go";

const Message = ({ name, status, message, avatar, onClick }) => {
  return (
    <div
      onClick={onClick}
      className=" w-full p-3 flex justify-between bg-primary border-1 border-borderNewFeed cursor-pointer rounded-3xl"
    >
      <div className="w-full flex items-center gap-x-2">
        <div className="relative">
          <img
            src={avatar}
            alt="avt"
            className="h-12 w-12 rounded-full border-1 border-borderNewFeed object-cover"
          />
          <GoDotFill
            color="#53C259"
            className="h-6 w-6 absolute -top-1 -left-2"
          />
        </div>
        <div className="flex flex-col">
          <div className="text-ascent-1">{name}</div>
          <div className="text-ascent-2">{message}</div>
        </div>
      </div>
      {status === "active" ? (
        <GoDotFill color="#53C259" className="h-6 w-6" />
      ) : (
        <GoDotFill color="#ccc" className="h-6 w-6" />
      )}
    </div>
  );
};

export default Message;
