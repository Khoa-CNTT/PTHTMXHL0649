import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BlankAvatar } from "~/assets/index";
import { useQuery } from "@tanstack/react-query";
import * as StoryService from "~/services/StoryService";
import StoryRowItem from "~/components/StoryRow/StoryRowItem";
import CreateStory from "~/components/CreateStory";
import PreviewStory from "~/components/PreviewStory";

const StoryRow = () => {
  const { t } = useTranslation();
  const user = useSelector((state) => state?.user);
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const [story, setStory] = useState([]);
  const [page, setPage] = useState(1);
  const [openCreateStory, setOpenCreateStory] = useState(false);
  const handleCloseCreateStory = () => setOpenCreateStory(false);
  const [openPreviewStory, setOpenPreviewStory] = useState(false);
  const handleClosePreviewStory = () => setOpenPreviewStory(false);

  const fetchStories = async () => {
    const res = await StoryService.getAllStory({ page });
    if (res?.code === 200) {
      setStory(res?.result?.data);
    }
  };

  const { refetch, isLoading } = useQuery({
    queryKey: ["story", page],
    queryFn: fetchStories,
  });

  const onSuccessCreateStory = () => {
    refetch();
  };

  const userStory = story.find((item) => item?.userId === user?.id);

  const otherStories = story.filter((item) => item?.userId !== user?.id);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full bg-primary py-4 border-b border-borderNewFeed">
      <CreateStory
        open={openCreateStory}
        handleClose={handleCloseCreateStory}
        onSuccess={onSuccessCreateStory}
      />
      <PreviewStory
        story={userStory}
        open={openPreviewStory}
        handleClose={handleClosePreviewStory}
      />
      <div className="flex px-4">
        {/* Fixed user story section */}
        <div className="flex-shrink-0 mr-4">
          <div className="flex flex-col items-center min-w-14">
            <div
              onClick={() => setOpenPreviewStory(true)}
              className="relative w-14 h-14 cursor-pointer  rounded-full p-0.5 bg-gradient-to-tr from-[#449BFF] to-[#9db106e3]"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                <img
                  src={userStory?.imageUrl || user?.avatar || BlankAvatar}
                  alt="Your Story"
                  className="w-full transform transition hover:-rotate-6 h-full object-cover rounded-full"
                />
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation(); // <--- thêm dòng này
                  setOpenCreateStory(true);
                }}
                className="absolute cursor-pointer bottom-0 right-0 bg-bgStandard rounded-full w-5 h-5 flex items-center justify-center border-2 border-white"
              >
                <span className="text-ascent-3 text-sm font-bold">+</span>
              </div>
            </div>
            <span className="text-xs mt-1 truncate w-16 text-center">
              Your story
            </span>
          </div>
        </div>

        {/* Scrollable section for other stories */}
        <div className="relative flex-1">
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-1 z-10"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide gap-4"
            onScroll={handleScroll}
          >
            {otherStories.map((item) => (
              <StoryRowItem item={item} />
            ))}
          </div>

          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-1 z-10"
            >
              <ChevronRight size={20} className="text-black" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryRow;
