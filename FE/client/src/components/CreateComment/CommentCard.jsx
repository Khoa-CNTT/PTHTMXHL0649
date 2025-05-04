import { Image, Input } from "antd";
import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useState } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { BlankAvatar } from "~/assets";
import { Button, CustomizeMenu } from "~/components";
import moment from "moment";
import useGetDetailUserById from "~/hooks/useGetDetailUserById";
import { TbDots } from "react-icons/tb";
import { useSelector } from "react-redux";
import { MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";
import { FaRegTrashCan } from "react-icons/fa6";
import { FaRegEdit } from "react-icons/fa";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as PostService from "~/services/PostService";
import EditComment from "~/components/CreateComment/EditComment";
import ConfirmDialog from "~/components/ConfirmDialog";

const CommentCard = ({
  comment,
  id,
  post,
  onDeleteCommentSuccess,
  onEditCommentSuccess,
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [onConfirmDelete, setOnConfirmDelete] = useState(false);
  const handleCloseConfirmDelete = () => setOnConfirmDelete(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const theme = useSelector((state) => state.theme);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [like, setLike] = useState(comment?.like || 0);
  const { t } = useTranslation();
  const handleClose = () => setAnchorEl(null);
  const { user } = useGetDetailUserById({ id: comment?.userId });
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const [showEdit, setShowEdit] = useState(false);
  const handleShowEdit = () => setShowEdit(false);
  const userState = useSelector((state) => state?.user);

  //delete cmt
  const mutationDelete = useMutationHook(({ postId, commentId }) =>
    PostService.deleteComment({ postId, commentId })
  );

  const handleOpenConfirmDelete = () => {
    handleClose();
    setOnConfirmDelete(true);
  };

  const { data, isPending, isSuccess } = mutationDelete;

  useEffect(() => {
    if (isSuccess) {
      onDeleteCommentSuccess(data?.result?.comments);
    }
  }, [isSuccess]);

  const handleShowEditComment = () => {
    setShowEdit(true);
    handleClose();
  };

  const handleDeleteComment = () => {
    mutationDelete.mutate({ postId: id, commentId: comment?.id });
    handleClose();
  };

  const handleLikeComment = async () => {
    const res = await PostService.likeComment({
      postId: id,
      commentId: comment?.id,
    });
    if (res?.code === 200) {
      setLike(res?.result?.like);
    }
  };

  const handleEditCommentSuccess = (data) => {
    onEditCommentSuccess(data);
  };

  return (
    <div className="w-full flex flex-col px-5">
      <ConfirmDialog
        open={onConfirmDelete}
        onClose={handleCloseConfirmDelete}
        onConfirm={handleDeleteComment}
        loading={isPending}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Xóa"
        className="w-[350px]"
        variant="danger"
      />
      <EditComment
        open={showEdit}
        handleClose={handleShowEdit}
        comment={comment}
        onSuccessEditComment={handleEditCommentSuccess}
        id={id}
      />

      <div className="flex items-start gap-x-3">
        <img
          src={user?.imageUrl || BlankAvatar}
          alt="User Avatar"
          className="w-10 h-10 rounded-full"
        />

        <div className="flex flex-col w-full">
          {/* User Info */}
          <div className="flex items-center gap-x-2">
            <span className="font-semibold text-base">{user?.username}</span>
            <span className="text-sm text-gray-500">
              {moment(comment?.createdDate).fromNow()}
            </span>
          </div>

          {/* Comment Text */}
          <p className="text-gray-700 text-sm">{comment?.content}</p>
          {comment?.imageUrls && comment?.imageUrls?.length > 0 && (
            <div>
              <Image
                src={comment?.imageUrls}
                alt="post image"
                loading="lazy"
                preview={false}
                className="w-48 h-36 border-1 border-borderNewFeed mt-2 rounded-lg cursor-pointer"
              />
            </div>
          )}

          {/* Like & Reply Buttons */}
          <div className="w-full flex gap-x-4 items-center mt-2">
            <button
              onClick={handleLikeComment}
              className="text-xs text-ascent-2 font-semibold"
            >
              Like {like}
            </button>
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <div className="w-full mt-2 relative bg-slate-100 rounded-2xl px-2 flex items-center gap-3">
              {showEmoji && (
                <div className="absolute top-full left-0 mt-2 z-50">
                  <EmojiPicker />
                </div>
              )}
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowEmoji(!showEmoji)}
                aria-label="Pick emoji"
              >
                <BsEmojiSmile className="text-xl" />
              </button>
              <Input
                className="w-full"
                placeholder="Reply..."
                variant="borderless"
              />
              <Button title="Đăng" className="py-2 text-sm px-2 font-medium" />
            </div>
          )}
        </div>

        {(userState?.id === comment?.userId ||
          post?.userId === userState?.id) && (
          <div>
            <TbDots
              size={20}
              onClick={handleClick}
              className="cursor-pointer"
            />
            <CustomizeMenu
              handleClose={handleClose}
              anchorEl={anchorEl}
              open={open}
              anchor={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={handleShowEditComment}>
                <div className="flex items-center justify-between w-full">
                  <span className="text-ascent-1">{t("Chỉnh sửa")}</span>
                  <FaRegEdit
                    color={theme === "light" && "black"}
                    className="text-bgStandard"
                  />
                </div>
              </MenuItem>
              <MenuItem onClick={handleOpenConfirmDelete}>
                <div className="flex items-center justify-between w-full">
                  <span className="text-red-600">{t("Xóa")}</span>
                  <FaRegTrashCan className="text-red-600" />
                </div>
              </MenuItem>
            </CustomizeMenu>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentCard;
