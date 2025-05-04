import React from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BlankAvatar } from "~/assets";

const SelectedMember = ({ handleRemoveMember, member }) => {
  console.log(member);
  return (
    <div className="flex items-center bg-slate-300 rounded-full p-1">
      <img
        className="w-7 h-7 rounded-full"
        src={member.imageUrl || BlankAvatar}
        alt=""
      />
      <p className="px-2 text-white">{member.username}</p>
      <AiOutlineClose
        onClick={() => handleRemoveMember(member)}
        className="cursor-pointer text-white"
      />
    </div>
  );
};

export default SelectedMember;
