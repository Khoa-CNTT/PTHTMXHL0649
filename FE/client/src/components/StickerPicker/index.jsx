import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BsEmojiLaughingFill } from "react-icons/bs";
import { Empty, Spin } from "antd";
import { searchSticker } from "~/redux/Slices/chatSlice";
import { createMessage } from "~/redux/Slices/messageSlice";
import { useDebounceHook } from "~/hooks/useDebounceHook";

const StickerPicker = ({ currentChat }) => {
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounceHook(searchQuery, 500);
  const popupRef = useRef(null);
  const dispatch = useDispatch();
  const chat = useSelector((state) => state?.chat);
  const stickers = chat?.searchSticker || [];
  const loading = chat?.loadingStickers || false;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowStickerPicker(false);
      }
    };

    if (showStickerPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStickerPicker]);

  useEffect(() => {
    if (debouncedQuery) {
      dispatch(searchSticker(debouncedQuery));
    }
  }, [debouncedQuery, dispatch]);

  useEffect(() => {
    if (showStickerPicker && !stickers.length && !searchQuery) {
      dispatch(searchSticker("popular"));
    }
  }, [showStickerPicker, stickers.length, dispatch, searchQuery]);

  const handleStickerClick = (stickerUrl) => {
    if (!currentChat?.id) return;

    const messageData = {
      chatId: currentChat.id,
      content: stickerUrl,
      type: "STICKER",
    };

    dispatch(createMessage({ data: messageData }));
    setShowStickerPicker(false);
  };

  return (
    <div className="relative flex ">
      <button
        className="text-gray-500 hover:text-blue transition-colors"
        onClick={() => setShowStickerPicker(!showStickerPicker)}
        aria-label="Pick sticker"
      >
        <BsEmojiLaughingFill className="text-xl" />
      </button>

      {showStickerPicker && (
        <div
          ref={popupRef}
          className="absolute bottom-10 left-0 bg-primary rounded-2xl shadow-lg w-80 z-50 border border-borderNewFeed overflow-hidden"
        >
          <div className="p-3">
            <input
              type="text"
              className="w-full px-3 py-2 rounded-full bg-bgSearch text-ascent-2 outline-none"
              placeholder="Search for stickers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="h-64 overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Spin />
              </div>
            ) : stickers.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {stickers.map((sticker, index) => (
                  <div
                    key={index}
                    className="cursor-pointer hover:bg-bgSearch rounded-md transition-colors p-1"
                    onClick={() => handleStickerClick(sticker)}
                  >
                    <img
                      src={sticker}
                      alt={"Sticker"}
                      className="w-full h-24 object-contain"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <Empty
                  description={
                    searchQuery
                      ? "No stickers found"
                      : "Start searching for stickers"
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StickerPicker;
