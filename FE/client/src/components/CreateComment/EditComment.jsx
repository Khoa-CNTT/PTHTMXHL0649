import { TextField } from "@mui/material";
import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsEmojiSmile, BsImages } from "react-icons/bs";
import { FaPhotoVideo } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import { PiGifThin } from "react-icons/pi";
import { useSelector } from "react-redux";
import { BlankAvatar } from "~/assets";
import { Button } from "~/components";
import DialogCustom from "~/components/DialogCustom";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as PostService from "~/services/PostService";

const EditComment = ({
  open,
  handleClose,
  comment,
  id,
  onSuccessEditComment,
}) => {
  const { t } = useTranslation();
  const user = useSelector((state) => state?.user);
  const [status, setStatus] = useState(comment?.content || "");
  const [files, setFiles] = useState([]);
  const [hasExistingImage, setHasExistingImage] = useState(false);
  const [deleteExistingImage, setDeleteExistingImage] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  // Initialize component state based on comment data
  useEffect(() => {
    if (comment?.imageUrl?.length > 0) {
      setHasExistingImage(true);
      setDeleteExistingImage(false);
    } else {
      setHasExistingImage(false);
    }
  }, [comment]);

  const handleChangeStatus = (e) => setStatus(e.target.value);

  const handleDeleteFile = () => {
    setFiles([]);

    // If we're deleting an existing image, set the flag to true
    if (hasExistingImage) {
      setDeleteExistingImage(true);
      setHasExistingImage(false);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setStatus((prevMessage) => prevMessage + emojiObject.emoji);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFiles([selectedFile]);
      setHasExistingImage(false); // Replace existing image
      setDeleteExistingImage(false); // We're replacing, not just deleting
    }
  };

  const mutation = useMutationHook(({ postId, commentId, data }) =>
    PostService.editComment({ postId, commentId, data })
  );

  const { data: response, isPending, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      if (
        response?.code === 200 &&
        response?.message === "Comment edited successfully"
      ) {
        handleClose();
        onSuccessEditComment(response?.result?.comments);
      }
    }
  }, [isSuccess]);

  const handleSubmitPost = () => {
    const requestData = {
      postId: id,
      commentId: comment?.id,
      data: {
        request: {
          content: status,
        },
        files: files,
      },
    };

    mutation.mutate(requestData);
  };

  const isSubmitDisabled =
    !status.trim() && !hasExistingImage && files.length === 0;

  return (
    <DialogCustom
      isOpen={open}
      width="640px"
      style={{
        overflow: "visible",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
      }}
      handleCloseDiaLogAdd={handleClose}
    >
      <div className="w-full flex flex-col h-full bg-center bg-cover bg-[url(/group.png)]">
        {/* Fixed Header */}
        <div className="w-full sticky top-0 z-10 flex items-center justify-between gap-5 px-6 py-4 bg-white bg-opacity-90">
          <button
            onClick={() => handleClose()}
            className="text-base hover:opacity-90 font-medium text-ascent-2"
          >
            {t("Hủy")}
          </button>
          <span className="text-lg font-semibold text-ascent-1">
            {t("Chỉnh sửa bình luận")}
          </span>
          <div className="w-7 h-7" />
        </div>
        <div className="w-full border-t-[0.1px] border-borderNewFeed" />

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto max-h-[60vh]">
          <div className="w-full flex flex-col px-5 py-4 justify-center gap-y-2">
            {/* User Avatar and Text Input */}
            <div className="flex flex-col w-full gap-y-3">
              <div className="w-full flex gap-x-3">
                <img
                  src={user?.avatar ?? BlankAvatar}
                  alt="User Image"
                  className="w-14 h-14 rounded-full border-1 flex-shrink-0 border-borderNewFeed object-cover shadow-newFeed"
                />
                <TextField
                  label={t("Có gì mới ?")}
                  multiline
                  id="content"
                  onChange={handleChangeStatus}
                  maxRows={5}
                  value={status}
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
                      "&.Mui-focused": {
                        display: "none",
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Media Upload Options */}
            <div className="flex gap-x-10 items-center px-6">
              <div className="h-9 border-solid border-borderNewFeed border-[0.1px]" />
              <div className="flex items-center justify-between py-4 gap-x-3">
                <label
                  htmlFor="fileUpload"
                  className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer"
                  title={t("Chỉ cho phép một ảnh")}
                >
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="fileUpload"
                    data-max-size="5120"
                    accept=".jpg, .png, .jpeg, .mp4, .wav, .gif"
                  />
                  <BsImages style={{ width: "20px", height: "20px" }} />
                </label>
                <label
                  htmlFor="videoUpload"
                  className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer"
                  title={t("Chỉ cho phép một video")}
                >
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="videoUpload"
                    data-max-size="5120"
                    accept=".mp4, .mov, .avi"
                  />
                  <FaPhotoVideo style={{ width: "20px", height: "20px" }} />
                </label>
                <label
                  htmlFor="gifUpload"
                  className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer"
                  title={t("Chỉ cho phép một GIF")}
                >
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="gifUpload"
                    data-max-size="5120"
                    accept=".gif"
                  />
                  <PiGifThin style={{ width: "25px", height: "25px" }} />
                </label>
                {showEmoji && (
                  <div className="fixed translate-y-44 translate-x-40 z-[99999]">
                    <EmojiPicker
                      style={{ height: "350px" }}
                      lazyLoadEmojis
                      onEmojiClick={handleEmojiClick}
                    />
                  </div>
                )}

                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowEmoji(!showEmoji)}
                  aria-label="Pick emoji"
                >
                  <BsEmojiSmile className="text-xl" />
                </button>
              </div>
            </div>

            {/* Image Preview Area */}
            <div className="w-full flex flex-col gap-y-2">
              {/* Show existing comment image if no new files selected and not flagged for deletion */}
              {files.length === 0 &&
                hasExistingImage &&
                !deleteExistingImage &&
                comment?.imageUrl?.length > 0 && (
                  <div className="w-full h-full relative">
                    <img
                      src={comment?.imageUrl[0]}
                      className="w-full h-full rounded-xl border-1 object-cover bg-no-repeat shadow-newFeed border-borderNewFeed"
                      alt="Comment image"
                    />
                    <IoCloseCircle
                      onClick={handleDeleteFile}
                      className="absolute top-0 right-0 m-2 w-7 h-7 fill-[#8D867F] cursor-pointer"
                    />
                  </div>
                )}

              {/* Show new selected file if any */}
              {files.length > 0 && (
                <div className="w-full h-full relative">
                  {files[0]?.type?.includes("mp4") ||
                  files[0]?.type?.includes("video") ? (
                    <video
                      width="100%"
                      controls
                      className="rounded-xl border-1 border-borderNewFeed"
                    >
                      <source src={URL.createObjectURL(files[0])} />
                    </video>
                  ) : (
                    <img
                      src={URL.createObjectURL(files[0])}
                      className="w-full h-full rounded-xl border-1 object-cover bg-no-repeat shadow-newFeed border-borderNewFeed"
                      alt="Uploaded file"
                    />
                  )}
                  <IoCloseCircle
                    onClick={handleDeleteFile}
                    className="absolute top-0 right-0 m-2 w-7 h-7 fill-[#8D867F] cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full border-t-[0.1px] border-borderNewFeed" />
        <div className="w-full flex items-center justify-end px-5 py-3 bg-white bg-opacity-90">
          <Button
            type="submit"
            title={isPending ? t("Đang gửi...") : t("Đăng")}
            onClick={handleSubmitPost}
            className={`bg-bgColor relative text-ascent-1 px-5 py-3 rounded-xl border-borderNewFeed border-1 font-semibold text-sm shadow-newFeed ${
              isSubmitDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disable={isSubmitDisabled || isPending}
          />
        </div>
      </div>
    </DialogCustom>
  );
};

export default EditComment;
