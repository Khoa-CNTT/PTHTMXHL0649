import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Button, Loading } from "..";
import { BlankAvatar } from "~/assets";
import { FormControl, MenuItem, Select, TextField } from "@mui/material";
import { BsEmojiSmile, BsImages } from "react-icons/bs";
import { IoIosAdd } from "react-icons/io";
import { FaCheck, FaPhotoVideo } from "react-icons/fa";
import { PiDotsThreeCircle, PiGifThin } from "react-icons/pi";
import { IoCloseCircle } from "react-icons/io5";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as PostService from "~/services/PostService";
import * as GroupService from "~/services/GroupService";
import * as AIService from "~/services/AIService";
import { useTranslation } from "react-i18next";
import { Dropdown, message, Switch } from "antd"; // Added Switch from antd
import EmojiPicker from "emoji-picker-react";
import AISuggestions from "./AISuggestion";
import { useTypewriterHook } from "~/hooks/useTypeWriterHook";
import DialogCustom from "~/components/DialogCustom";

const CreatePost = ({
  buttonRight,
  profilePage,
  homePage,
  group,
  groupId,
  handleRefetch,
}) => {
  const { t } = useTranslation();
  const theme = useSelector((state) => state.theme.theme);
  const user = useSelector((state) => state.user);

  // Combined form state
  const [postData, setPostData] = useState({
    content: "",
    files: [],
    visibility: "PUBLIC",
    useAI: false,
  });

  // UI state
  const [uiState, setUiState] = useState({
    isOpen: false,
    showEmoji: false,
    isMobile: false,
  });

  // For AI generated content
  const [aiGeneratedContent, setAiGeneratedContent] = useState("");
  const [displayedText] = useTypewriterHook({
    words: [aiGeneratedContent],
    loop: 1,
    typeSpeed: 50,
    deleteSpeed: 0,
    delaySpeed: 1000,
  });

  // Check if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setUiState((prev) => ({ ...prev, isMobile: window.innerWidth < 768 }));
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Form handling functions
  const handleContentChange = useCallback((e) => {
    setPostData((prev) => ({ ...prev, content: e.target.value }));
  }, []);

  const handleVisibilityChange = useCallback((e) => {
    setPostData((prev) => ({ ...prev, visibility: e.target.value }));
  }, []);

  const handleToggleAI = useCallback((checked) => {
    setPostData((prev) => ({ ...prev, useAI: checked }));
  }, []);

  const handleEmojiClick = useCallback((emojiObject) => {
    setPostData((prev) => ({
      ...prev,
      content: prev.content + emojiObject.emoji,
    }));
  }, []);

  const handleToggleEmoji = useCallback(() => {
    setUiState((prev) => ({ ...prev, showEmoji: !prev.showEmoji }));
  }, []);

  const handleSelectAIContent = useCallback((content) => {
    setAiGeneratedContent(content);
    setPostData((prev) => ({ ...prev, content }));
  }, []);

  // File handling
  const handleFileChange = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    // Check file types and sizes here if needed
    setPostData((prev) => ({
      ...prev,
      files: [...prev.files, ...selectedFiles],
    }));
  }, []);

  const handleDeleteFile = useCallback((index) => {
    setPostData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  }, []);

  // Modal handling
  const handleOpenModal = useCallback(() => {
    if (user?.token) {
      setUiState((prev) => ({ ...prev, isOpen: true }));
    }
  }, [user?.token]);

  const handleClose = useCallback(() => {
    setPostData({
      content: "",
      files: [],
      visibility: "PUBLIC",
      useAI: false,
    });
    setUiState((prev) => ({ ...prev, isOpen: false, showEmoji: false }));
  }, []);

  // API mutations
  const regularPostMutation = useMutationHook(({ data }) =>
    PostService.createPost({ data })
  );

  const aiPostMutation = useMutationHook(({ data }) =>
    AIService.createPost({ data })
  );

  const groupPostMutation = useMutationHook(({ data }) =>
    GroupService.createPost({ data })
  );

  // Submission handler - unified for all post types
  const handleSubmitPost = useCallback(() => {
    const { content, files, visibility, useAI } = postData;

    // Validate input
    if (files.length === 0 && !content.trim()) {
      return;
    }

    // Prepare data based on post type
    if (group) {
      const request = { content, groupId };
      const data = { request, files };
      const token = localStorage.getItem("token");
      groupPostMutation.mutate({ data, token });
    } else {
      const request = { content, visibility };
      const data = { request, files };

      if (useAI) {
        aiPostMutation.mutate({ data });
      } else {
        regularPostMutation.mutate({ data });
      }
    }

    // Close the modal
    handleClose();

    // Show loading message
    message.destroy();
    message.open({
      type: "loading",
      duration: 0,
      content: t("Create post..."),
    });
  }, [postData, group, groupId, handleClose, t]);

  // Handle mutations response
  useEffect(() => {
    const {
      isSuccess: isRegularSuccess,
      data: regularData,
      isPending: isRegularPending,
    } = regularPostMutation;
    const {
      isSuccess: isAISuccess,
      data: aiData,
      isPending: isAIPending,
    } = aiPostMutation;
    const {
      isSuccess: isGroupSuccess,
      data: groupData,
      isPending: isGroupPending,
      isError: isGroupError,
    } = groupPostMutation;

    // Handle regular or AI post response
    if (isRegularSuccess || isAISuccess) {
      const responseData = regularData || aiData;
      message.destroy();

      if (responseData?.code === 200) {
        handleRefetch?.(true);
        message.open({
          type: "success",
          content: t("Tạo bài viết thành công!"),
        });
      } else {
        message.open({
          type: "error",
          content: responseData?.message || t("Đã xảy ra lỗi!"),
        });
      }
    }

    // Handle group post response
    if (isGroupSuccess) {
      message.destroy();

      if (groupData?.code === 200) {
        handleRefetch?.(true);
        message.open({
          type: "success",
          content: t("Tạo bài viết thành công!"),
        });
      } else if (groupData?.code === 400) {
        message.open({
          type: "error",
          content: t(
            "Nội dung bài đăng không phù hợp và vi phạm chính sách nội dung của chúng tôi."
          ),
        });
      }
    }

    // Handle group post error
    if (isGroupError) {
      message.destroy();
      message.open({
        type: "error",
        content: t("Đã xảy ra lỗi!"),
      });
    }
  }, [
    regularPostMutation.isSuccess,
    regularPostMutation.data,
    aiPostMutation.isSuccess,
    aiPostMutation.data,
    groupPostMutation.isSuccess,
    groupPostMutation.data,
    groupPostMutation.isError,
    t,
    handleRefetch,
  ]);

  // Render different buttons based on props
  const renderButton = () => {
    if (buttonRight) {
      return (
        <div className="fixed bottom-5 right-5 z-50">
          <div
            onClick={handleOpenModal}
            className="bg-primary w-[60px] h-[60px] md:w-[70px] md:h-[70px] border-1 border-borderNewFeed shadow-2xl hover:scale-105 active:scale-90 transition-transform flex items-center justify-center rounded-3xl cursor-pointer"
          >
            <IoIosAdd
              className="text-bgStandard"
              size={uiState.isMobile ? 30 : 35}
            />
          </div>
        </div>
      );
    }

    if (profilePage) {
      return (
        <Button
          onClick={handleOpenModal}
          title={t("Đăng")}
          className="px-3 py-1.5 md:px-4 md:py-2 hover:scale-105 active:scale-90 transition-transform border-x-[0.8px] border-y-[0.8px] border-borderNewFeed rounded-xl text-ascent-1"
        />
      );
    }

    if (homePage) {
      return (
        <Button
          title={t("Đăng")}
          onClick={handleOpenModal}
          className="bg-primary text-bgStandard border-1 border-borderNewFeed py-1.5 px-4 md:py-2 md:px-6 rounded-xl shadow-sm text-sm font-semibold shadow-newFeed hover:scale-105 active:scale-90 transition-transform"
        />
      );
    }

    if (group) {
      return (
        <Button
          title={t("Đăng")}
          onClick={handleOpenModal}
          className="bg-bluePrimary text-white py-1.5 px-4 md:py-2 md:px-6 rounded-xl font-medium text-sm border-borderNewFeed shadow-newFeed hover:scale-105 active:scale-90 transition-transform"
        />
      );
    }

    return null;
  };

  // Render files previews
  const renderFiles = () => {
    return postData.files.map((file, index) => {
      const fileURL = URL.createObjectURL(file);

      if (file?.type?.includes("mp4")) {
        return (
          <div key={index} className="relative">
            <video
              width="100%"
              controls
              className="rounded-xl border-1 border-borderNewFeed"
            >
              <source src={fileURL} />
            </video>
            <IoCloseCircle
              onClick={() => handleDeleteFile(index)}
              className="absolute top-0 right-0 m-2 w-6 h-6 md:w-7 md:h-7 fill-[#8D867F] cursor-pointer"
            />
          </div>
        );
      }

      if (
        file?.type.includes("jpeg") ||
        file?.type.includes("png") ||
        file?.type.includes("gif")
      ) {
        return (
          <div key={index} className="w-full h-full relative">
            <img
              src={fileURL}
              alt="User upload"
              className="w-full h-full rounded-xl border-1 object-cover bg-no-repeat shadow-newFeed border-borderNewFeed"
            />
            <IoCloseCircle
              onClick={() => handleDeleteFile(index)}
              className="absolute top-0 right-0 m-2 w-6 h-6 md:w-7 md:h-7 fill-[#8D867F] cursor-pointer"
            />
          </div>
        );
      }

      return null;
    });
  };

  // Post submission button with loading state
  const renderSubmitButton = () => {
    const isLoading = group
      ? groupPostMutation.isPending
      : regularPostMutation.isPending || aiPostMutation.isPending;

    const isDisabled = postData.files.length === 0 && !postData.content.trim();

    return (
      <div className="relative">
        <Button
          type="submit"
          title={t("Đăng")}
          onClick={handleSubmitPost}
          className="bg-bgColor relative text-ascent-1 px-3 py-2 md:px-5 md:py-3 rounded-xl border-borderNewFeed border-1 font-semibold text-xs md:text-sm shadow-newFeed"
          disable={isDisabled || isLoading}
        />
        {isLoading && <Loading className="absolute top-0 -translate-y-2" />}
      </div>
    );
  };

  return (
    <div>
      {renderButton()}

      <DialogCustom
        isOpen={uiState.isOpen}
        theme={theme}
        width={uiState.isMobile ? "92%" : "660px"}
        marginBottom={uiState.isMobile ? "60px" : "77px"}
        style={{ overflow: "visible" }}
        handleCloseDiaLogAdd={handleClose}
      >
        <div className="w-full bg-[url(/group.png)] bg-center bg-cover border-1 overflow-y-auto border-borderNewFeed bg-primary rounded-2xl mx-auto">
          {/* header */}
          <div className="w-full flex items-center justify-between gap-2 md:gap-5 px-3 md:px-6 py-3 md:py-4">
            <button
              onClick={handleClose}
              className="text-sm md:text-base hover:opacity-90 font-medium text-ascent-2"
            >
              {t("Hủy")}
            </button>
            <span className="text-base md:text-lg font-semibold text-ascent-1">
              {t("Tạo bài viết")}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm text-ascent-2">
                {t("Use AI generate")}
              </span>
              <Switch
                size={uiState.isMobile ? "small" : "default"}
                checked={postData.useAI}
                onChange={handleToggleAI}
              />
            </div>
          </div>
          <div className="w-full border-t-[0.1px] border-borderNewFeed" />

          {/* body */}
          <div className="w-full flex flex-col px-3 md:px-5 py-3 md:py-4 justify-center gap-y-2">
            {/* User info and content input  */}
            <div className="flex flex-col w-full gap-y-3">
              <div className="w-full flex gap-x-2 md:gap-x-3">
                <img
                  src={user?.avatar ?? BlankAvatar}
                  alt="User"
                  className="w-10 h-10 md:w-14 md:h-14 rounded-full border-1 flex-shrink-0 border-borderNewFeed object-cover shadow-newFeed"
                />
                <TextField
                  label={t("Có gì mới ?")}
                  multiline
                  id="content"
                  onChange={handleContentChange}
                  maxRows={uiState.isMobile ? 4 : 5}
                  value={postData.content}
                  variant="standard"
                  fullWidth
                  sx={{
                    "& .MuiInput-root": {
                      color: "#000",
                      "&:before": {
                        display: "none",
                      },
                      "&:after": {
                        display: "none",
                      },
                    },
                    "& .MuiInputLabel-standard": {
                      color: "rgb(89, 91, 100)",
                      fontSize: uiState.isMobile ? "0.875rem" : "1rem",
                      "&.Mui-focused": {
                        display: "none",
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Media and emoji controls */}
            <div className="flex gap-x-4 md:gap-x-10 items-center px-2 md:px-6">
              <div className="h-9 border-solid border-borderNewFeed border-[0.1px]" />
              <div
                className={`flex items-center ${
                  uiState.isMobile
                    ? "justify-around w-full"
                    : "justify-between gap-x-3"
                } py-2 md:py-4`}
              >
                {/* File upload buttons */}
                <label
                  htmlFor="fileUpload"
                  className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer"
                >
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="fileUpload"
                    data-max-size="5120"
                    accept=".jpg, .png, .jpeg, .mp4, .wav, .gif"
                    multiple
                  />
                  <BsImages style={{ width: "20px", height: "20px" }} />
                </label>
                <label
                  htmlFor="videoUpload"
                  className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer"
                >
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="videoUpload"
                    data-max-size="5120"
                    accept=".mp4"
                  />
                  <FaPhotoVideo style={{ width: "20px", height: "20px" }} />
                </label>
                <label
                  htmlFor="gifUpload"
                  className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer"
                >
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="gifUpload"
                    accept=".gif"
                  />
                  <PiGifThin style={{ width: "25px", height: "25px" }} />
                </label>

                {/* AI content suggestions */}
                <AISuggestions onSelectContent={handleSelectAIContent} />

                {/* Emoji picker */}
                {uiState.showEmoji && (
                  <div
                    className={`fixed ${
                      uiState.isMobile
                        ? "translate-y-36"
                        : "translate-y-44 translate-x-40"
                    } z-[99999]`}
                  >
                    <EmojiPicker
                      style={{
                        height: uiState.isMobile ? "280px" : "350px",
                        width: uiState.isMobile ? "280px" : "auto",
                      }}
                      lazyLoadEmojis
                      onEmojiClick={handleEmojiClick}
                    />
                  </div>
                )}

                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={handleToggleEmoji}
                  aria-label="Pick emoji"
                >
                  <BsEmojiSmile className="text-xl" />
                </button>
              </div>
            </div>

            {/* File previews */}
            <div className="w-full flex flex-col gap-y-2">{renderFiles()}</div>

            {/* Post controls */}
            <div className="w-full flex justify-between">
              {/* Visibility selector */}
              <FormControl
                sx={{ m: 1, minWidth: uiState.isMobile ? 90 : 120 }}
                size="small"
                variant="standard"
              >
                <Select
                  disableUnderline="true"
                  labelId="demo-select-small-label"
                  id="demo-select-small"
                  value={postData.visibility}
                  onChange={handleVisibilityChange}
                  sx={{
                    boxShadow: "none",
                    fontSize: uiState.isMobile ? "0.75rem" : "0.875rem",
                    "& .MuiSelect-icon": {
                      display: "none",
                    },
                  }}
                >
                  <MenuItem value={"PUBLIC"}>
                    <span className="text-ascent-2 text-xs md:text-sm">
                      {uiState.isMobile
                        ? t("Công khai")
                        : t("Bất cứ ai cũng có thể xem bài viết của bạn")}
                    </span>
                  </MenuItem>
                  <MenuItem value={"PRIVATE"}>
                    <span className="text-ascent-2 text-xs md:text-sm">
                      {t("Chỉ mình bạn")}
                    </span>
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Submit button */}
              {renderSubmitButton()}
            </div>
          </div>
        </div>
      </DialogCustom>
    </div>
  );
};

export default CreatePost;
