import { useCallback, useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Button } from "..";
import { BlankAvatar } from "~/assets";
import {
  FormControl,
  MenuItem,
  Select,
  TextField,
  Fade,
  Tooltip,
} from "@mui/material";
import { IoCloseCircle } from "react-icons/io5";
import { BsEmojiSmile, BsImages } from "react-icons/bs";
import { FaPhotoVideo } from "react-icons/fa";
import { PiGifThin } from "react-icons/pi";
import { MdOutlineMotionPhotosAuto } from "react-icons/md";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as StoryService from "~/services/StoryService";
import useDragAndDrop from "~/hooks/useDragAndDrop";
import { useTranslation } from "react-i18next";
import { message } from "antd";
import EmojiPicker from "emoji-picker-react";
import CustomModal from "~/components/CustomModal";
import { motion } from "framer-motion";

const CreateStory = ({ handleClose, open, onSuccess }) => {
  const user = useSelector((state) => state.user);
  const theme = useSelector((state) => state.theme.theme);
  const [status, setStatus] = useState("");
  const [listFiles, setListFiles] = useState([]);
  const [postState, setPostState] = useState("PUBLIC");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [uploadStep, setUploadStep] = useState("edit"); // 'edit' or 'preview'
  const [isSelectOpen, setIsSelectOpen] = useState(false); // Track if Select is open
  const token = localStorage.getItem("token");
  const inputFileRef = useRef(null);
  const { t } = useTranslation();

  // Check if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleChangeStatus = useCallback((e) => {
    setStatus(e.target.value);
  }, []);

  const handleEmojiClick = useCallback((emojiObject) => {
    setStatus((prevMessage) => prevMessage + emojiObject.emoji);
  }, []);

  const toggleEmoji = useCallback(() => {
    setShowEmoji((prev) => !prev);
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setListFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
      setUploadStep("preview");
    }
  };

  const handleDeleteFile = (index) => {
    setListFiles((prevFiles) => {
      const newFiles = prevFiles.filter((_, i) => i !== index);
      if (newFiles.length === 0) {
        setUploadStep("edit");
      }
      return newFiles;
    });
  };

  // drag&drop
  const onDrop = (files) => {
    if (files.length > 0) {
      setListFiles((prevFiles) => [...prevFiles, ...files]);
      setUploadStep("preview");
    }
  };

  const { isDragging, handleDragOver, handleDragLeave, handleDrop } =
    useDragAndDrop(onDrop);

  const handleClick = () => {
    if (inputFileRef.current) {
      inputFileRef.current.click();
    }
  };

  // Reset form when closing
  const handleCloseModal = () => {
    setStatus("");
    setListFiles([]);
    setUploadStep("edit");
    setShowEmoji(false);
    handleClose();
  };

  // Submit post
  const mutation = useMutationHook((data) => StoryService.createStory(data));
  const { data, isPending, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      if (data?.code === 200) {
        message.destroy();
        message.success(t("Tạo story thành công"));
        onSuccess();
        handleCloseModal();
      }
    } else if (isPending) {
      handleClose();
      message.loading({
        content: "Creating story...",
        key: "storyCreation",
        duration: 0,
      });
    }
  }, [isSuccess, isPending]);

  const handleSubmitPost = () => {
    const request = { content: status, visibility: postState };
    const data = { request, files: listFiles };
    mutation.mutate(data);
  };

  const isFormValid = status.trim() !== "" || listFiles.length > 0;

  return (
    <CustomModal
      isOpen={open}
      onClose={handleCloseModal}
      closeOnClickOutside={!isSelectOpen && !showEmoji} // Disable close on outside click when select is open
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className={`shadow-xl border-1 border-borderNewFeed w-full max-w-[620px] mx-auto ${
          theme === "dark" ? "bg-[#1F1F23]" : "bg-primary"
        } rounded-3xl overflow-hidden flex flex-col max-h-[90vh]`} // Set max height and make it a flex column
      >
        {/* Header - fixed at top */}
        <div className="w-full flex items-center justify-between px-5 py-4 border-b border-borderNewFeed sticky top-0 z-10 bg-inherit">
          <button
            onClick={handleCloseModal}
            className="text-base font-medium text-ascent-1 hover:text-red-500 transition duration-300"
          >
            {t("Hủy")}
          </button>
          <span className="text-lg font-semibold text-ascent-1">
            {t("Tạo story")}
          </span>
          <div className="w-10" /> {/* Spacer for balanced header */}
        </div>

        {/* Body - scrollable content */}
        <div className="w-full flex-1 overflow-y-auto custom-scrollbar px-5 py-4">
          <div className="flex flex-col gap-4">
            {/* User info and content input */}
            <div className="flex w-full gap-3 items-start">
              <div className="relative">
                <img
                  src={user?.avatar ?? BlankAvatar}
                  alt="User"
                  className="w-12 h-12 rounded-full border-2 border-borderNewFeed object-cover shadow-md"
                />
                <div className="absolute -bottom-1 -right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1">
                <div className="font-medium text-ascent-1 mb-1">
                  {user?.username || "User"}
                </div>
                <div className="flex items-center gap-2">
                  <FormControl
                    variant="outlined"
                    size="small"
                    className="min-w-[100px]"
                  >
                    <Select
                      value={postState}
                      onChange={(e) => setPostState(e.target.value)}
                      onOpen={() => setIsSelectOpen(true)}
                      onClose={() => setIsSelectOpen(false)}
                      className="h-7 rounded-full text-xs"
                      MenuProps={{
                        disableScrollLock: true,
                        anchorOrigin: {
                          vertical: "bottom",
                          horizontal: "left",
                        },
                        transformOrigin: {
                          vertical: "top",
                          horizontal: "left",
                        },
                        slotProps: {
                          backdrop: {
                            onClick: (e) => e.stopPropagation(),
                          },
                        },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0, 0, 0, 0.12)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0, 0, 0, 0.24)",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#4B5563",
                        },
                        "& .MuiSelect-select": {
                          paddingTop: "2px",
                          paddingBottom: "2px",
                        },
                      }}
                    >
                      <MenuItem value="PUBLIC" dense>
                        <span className="text-xs">🌎 {t("Công khai")}</span>
                      </MenuItem>
                      <MenuItem value="PRIVATE" dense>
                        <span className="text-xs">🔒 {t("Riêng tư")}</span>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
            </div>

            {/* Text input */}
            <TextField
              placeholder={t("Bạn đang nghĩ gì? Chia sẻ với mọi người...")}
              multiline
              rows={3}
              variant="outlined"
              value={status}
              onChange={handleChangeStatus}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.12)",
                    borderRadius: "12px",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(0, 0, 0, 0.24)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#4B5563",
                  },
                },
              }}
            />

            {/* Media tools */}
            <div className="flex items-center justify-between px-2 py-2 bg-bgSearch rounded-lg">
              <div className="text-sm font-medium text-ascent-2">
                {t("Thêm vào story của bạn")}
              </div>
              <div className="flex items-center gap-4">
                <Tooltip title={t("Thêm ảnh/video")} arrow placement="top">
                  <button
                    onClick={handleClick}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition duration-200"
                  >
                    <BsImages size={20} className="text-blue" />
                  </button>
                </Tooltip>

                <Tooltip title={t("Thêm video")} arrow placement="top">
                  <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition duration-200">
                    <FaPhotoVideo size={20} className="text-green-500" />
                  </button>
                </Tooltip>

                <Tooltip title={t("Thêm GIF")} arrow placement="top">
                  <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition duration-200">
                    <PiGifThin size={22} className="text-purple-500" />
                  </button>
                </Tooltip>

                <Tooltip title={t("Thêm emoji")} arrow placement="top">
                  <button
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition duration-200"
                    onClick={toggleEmoji}
                  >
                    <BsEmojiSmile size={20} className="text-yellow-500" />
                  </button>
                </Tooltip>

                <Tooltip
                  title={t("Tạo hiệu ứng chuyển động")}
                  arrow
                  placement="top"
                >
                  <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition duration-200">
                    <MdOutlineMotionPhotosAuto
                      size={22}
                      className="text-red-500"
                    />
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Emoji picker */}
            {showEmoji && (
              <Fade in={showEmoji}>
                <div
                  className="absolute z-50 right-8"
                  style={{ top: "calc(50% - 100px)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    lazyLoadEmojis
                    searchDisabled={isMobile}
                    width={isMobile ? 280 : 320}
                    height={isMobile ? 320 : 400}
                  />
                </div>
              </Fade>
            )}

            {/* Upload area - only show when no files are selected */}
            {uploadStep === "edit" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
                className={`w-full ${
                  isDragging ? "bg-blue" : "bg-bgSearch"
                } h-[200px] transition-colors duration-300 border-2 flex flex-col items-center justify-center border-dashed ${
                  isDragging ? "border-blue" : "border-borderNewFeed"
                } rounded-xl cursor-pointer hover:bg-gray-100`}
              >
                <div className="w-16 h-16 mb-3 flex items-center justify-center rounded-full bg-gray-100">
                  <BsImages size={28} className="text-gray-500" />
                </div>
                <p className="text-center text-ascent-1 font-medium">
                  {isDragging
                    ? t("Thả tập tin của bạn ở đây")
                    : t("Kéo và thả tập tin ở đây hoặc nhấn để tải lên")}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {t("Hỗ trợ JPG, PNG, GIF, MP4")}
                </p>
                <input
                  type="file"
                  ref={inputFileRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  multiple
                  accept=".jpg, .jpeg, .png, .gif, .mp4"
                />
              </motion.div>
            )}

            {/* File previews - only show when files are selected */}
            {uploadStep === "preview" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="grid grid-cols-1 gap-4">
                  {listFiles.map((file, index) => {
                    const fileURL = URL.createObjectURL(file);

                    if (file?.type?.includes("mp4")) {
                      return (
                        <div
                          key={index}
                          className="relative rounded-xl overflow-hidden shadow-md"
                        >
                          <video
                            width="100%"
                            controls
                            className="rounded-xl border border-borderNewFeed"
                          >
                            <source src={fileURL} />
                          </video>
                          <button
                            onClick={() => handleDeleteFile(index)}
                            className="absolute top-2 right-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition duration-200 p-1"
                          >
                            <IoCloseCircle className="w-6 h-6 text-white" />
                          </button>
                        </div>
                      );
                    }

                    if (
                      file?.type.includes("jpeg") ||
                      file?.type.includes("png") ||
                      file?.type.includes("gif")
                    ) {
                      return (
                        <div
                          key={index}
                          className="relative rounded-xl overflow-hidden shadow-md group"
                        >
                          <img
                            src={fileURL}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover rounded-xl border border-borderNewFeed"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent event bubbling
                              handleDeleteFile(index);
                            }}
                            className="absolute top-2 right-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition duration-200 p-1"
                          >
                            <IoCloseCircle className="w-6 h-6 text-white" />
                          </button>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>

                {/* Add more files button */}
                <button
                  onClick={handleClick}
                  className="mt-4 w-full py-3 border border-dashed border-borderNewFeed rounded-xl flex items-center justify-center hover:bg-gray-50 transition duration-200"
                >
                  <BsImages className="mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {t("Thêm ảnh hoặc video")}
                  </span>
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer - fixed at bottom */}
        <div className="w-full flex justify-end px-5 py-4 border-t border-borderNewFeed sticky bottom-0 z-10 bg-inherit">
          <Button
            type="submit"
            title={isPending ? t("Đang tạo...") : t("Đăng story")}
            onClick={handleSubmitPost}
            className={`relative ${
              isFormValid ? "bg-blue hover:bg-blue" : "bg-gray-300"
            } text-white px-6 py-3 rounded-xl font-medium text-sm transition duration-300 shadow-md hover:shadow-lg`}
            disable={!isFormValid || isPending}
          />
        </div>
      </motion.div>
    </CustomModal>
  );
};

export default CreateStory;
