import React, { useState } from "react";
import { BlankAvatar } from "~/assets";
import moment from "moment";
import StoryTimer from "../PreviewStory";
import PreviewStory from "../PreviewStory";

const StoryCard = ({ story }) => {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  return (
    <div className="flex gap-4 w-full justify-center items-center cursor-pointer">
      <PreviewStory story={story} open={open} handleClose={handleClose} />
      <div
        onClick={() => setOpen(true)}
        className="bg-gradient-to-tr from-[#449BFF] to-[#9db106e3] p-[3px] rounded-full cursor-pointer"
      >
        <img
          className="w-12 h-12 rounded-full block object-cover bg-white p-[2px] transform transition hover:-rotate-6"
          src={story?.imageUrl || BlankAvatar}
        />
      </div>
      <div className="flex-1">
        <p className="text-base font-medium text-ascent-1">{story?.username}</p>
        <span className="text-sm text-ascent-2">
          {moment(story?.postedAt).fromNow()}
        </span>
        <StoryTimer postedAt={story?.postedAt} expiryTime={story?.expiryTime} />
      </div>
    </div>
  );
};

export default StoryCard;
