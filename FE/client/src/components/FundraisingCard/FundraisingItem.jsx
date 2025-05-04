import { Bookmark, Clock, Users } from "lucide-react";
import React from "react";

const FundraisingItem = () => {
  return (
    <div className="relative w-80 bg-primary rounded-xl shadow-xl p-4 space-y-4">
      <div className="relative">
        <img
          src="/fundrai.jfif"
          alt="Give"
          className="w-full h-32 object-cover rounded-lg"
        />
        <button className="absolute top-2 right-2 bg-primary p-2 rounded-full shadow-md">
          <Bookmark className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <h3 className="text-base font-semibold">
        Clothes & needs for the homeless
      </h3>

      <p className="text-gray-500 text-sm">
        <span className="font-semibold">$9500</span> raised from{" "}
        <span className="font-semibold">$10,000</span> total
      </p>

      <div className="relative w-full bg-gray-200 h-2 rounded-full">
        <div
          className="absolute top-0 left-0 bg-blue h-2 rounded-full"
          style={{ width: "95%" }}
        ></div>
      </div>

      <div className="flex gap-x-4 items-center text-gray-500 text-sm">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>300 patrons</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>5 days left</span>
        </div>
      </div>
    </div>
  );
};

export default FundraisingItem;
