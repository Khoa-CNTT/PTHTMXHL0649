import React, { useState } from "react";
import { BlankAvatar } from "~/assets";
import PreviewStory from "~/components/PreviewStory";
import StoryTimer from "../../components/PreviewStory";

const StoryRowItem = ({ item }) => {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);

  return (
    <>
      <PreviewStory story={item} open={open} handleClose={handleClose} />

      <div
        onClick={() => setOpen(true)}
        className="flex cursor-pointer flex-col items-center min-w-14"
      >
        <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#449BFF] to-[#9db106e3]">
          <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
            <img
              src={item.imageUrl || BlankAvatar}
              alt={item.username}
              className="w-full h-full transform transition hover:-rotate-6 object-cover rounded-full"
            />
          </div>
        </div>
        <span className="text-xs mt-1 truncate w-14 text-center">
          {item.username}
        </span>
        <StoryTimer postedAt={item?.postedAt} expiryTime={item?.expiryTime} />
      </div>
    </>
  );
};

export default StoryRowItem;
