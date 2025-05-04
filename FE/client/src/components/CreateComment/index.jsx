import { useSelector } from "react-redux";
import { Button } from "..";
import CommentCard from "~/components/CreateComment/CommentCard";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile } from "react-icons/bs";
import { message, Modal, Spin, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as PostService from "~/services/PostService";
import { MdOutlineFileUpload, MdClose } from "react-icons/md";
import TextArea from "antd/es/input/TextArea";
import { useTranslation } from "react-i18next";
import { IoCloseOutline } from "react-icons/io5";

const CreateComment = ({
  handleClose,
  open,
  id,
  comments,
  post,
  isSuccessChange,
}) => {
  const theme = useSelector((state) => state?.theme?.theme);
  const [showEmoji, setShowEmoji] = useState(false);
  const [content, setContent] = useState("");
  const [listComments, setListComments] = useState(comments || []);
  const [file, setFile] = useState();
  const { t } = useTranslation();

  const handleClear = () => {
    setContent("");
    setFile(null);
  };

  const handleEmojiClick = (emojiObject) => {
    setContent((prevMessage) => prevMessage + emojiObject.emoji);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      message.error("File phải nhỏ hơn 5MB!");
      return;
    }
    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const mutation = useMutationHook(({ id, data }) =>
    PostService.comment({ id, data })
  );

  const { data, isPending, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      handleClear();
      isSuccessChange(data?.result?.commentCount);
      setListComments(data?.result?.comments);
    }
  }, [isSuccess]);

  const handleSubmitPost = () => {
    const request = { content };
    const data = {
      request,
      files: file ? [file] : [],
    };
    mutation.mutate({ id, data });
  };

  const getShortFileName = (name, maxLength = 20) => {
    return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
  };

  const onDeleteCommentSuccess = (newComments) => {
    setListComments(newComments);
  };

  const onEditCommentSuccess = (newComments) => {
    setListComments(newComments);
  };

  return (
    <Modal
      className="customized-modal"
      open={open}
      closable={false}
      onClose={handleClose}
      centered
      width={550}
      footer={null}
    >
      <div className="w-full rounded-2xl mx-auto h-full bg-bgColor flex flex-col">
        {/* Header */}
        <div className="w-full flex items-center justify-between py-4 px-6 text-lg border-b border-borderNewFeed font-semibold">
          <span>Comments</span>
          <IoCloseOutline
            onClick={() => handleClose()}
            size={26}
            className="cursor-pointer"
          />
        </div>

        {/* Comments List - Set default height here */}
        <div className="overflow-y-auto flex flex-col py-4 gap-y-4 h-96">
          {listComments?.length > 0 ? (
            listComments.map((comment, i) => (
              <CommentCard
                key={i}
                comment={comment}
                id={id}
                post={post}
                onEditCommentSuccess={onEditCommentSuccess}
                onDeleteCommentSuccess={onDeleteCommentSuccess}
              />
            ))
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-500">
              {t("No comments yet")}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="w-full relative rounded-bl-xl rounded-br-xl border-t px-6 border-borderNewFeed p-3 bg-white flex items-center gap-3">
          {showEmoji && (
            <div className="absolute bottom-full left-0 mb-2">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowEmoji(!showEmoji)}
            aria-label="Pick emoji"
          >
            <BsEmojiSmile className="text-xl" />
          </button>

          {/* Input comment */}
          <div className="w-full relative border border-gray-300 rounded-lg p-2">
            <TextArea
              maxLength={200}
              className="w-full border-none focus:ring-0"
              autoSize={{ minRows: 1, maxRows: 2 }}
              onChange={(e) => setContent(e.target.value)}
              value={content}
              placeholder="Comment..."
            />

            {/* Upload file bằng input */}
            <div className=" flex items-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <MdOutlineFileUpload size={25} className="pl-2" />
              </label>

              {/* Hiển thị tên file + nút xóa */}
              {file && (
                <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-md">
                  <Tooltip title={file.name} placement="top">
                    <span className="text-xs text-gray-700">
                      {getShortFileName(file.name)}
                    </span>
                  </Tooltip>
                  <button
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Remove file"
                  >
                    <MdClose size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Nút đăng bình luận */}
          <Button
            onClick={handleSubmitPost}
            title={isPending ? <Spin size="small" /> : "Đăng"}
            className="py-2 text-sm px-2 font-semibold"
          />
        </div>
      </div>
    </Modal>
  );
};

export default CreateComment;
