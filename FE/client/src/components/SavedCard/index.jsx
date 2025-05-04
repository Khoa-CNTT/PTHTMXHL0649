import moment from "moment";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { CustomizeMenu } from "..";
import { MenuItem } from "@mui/material";
import { BiSolidLockAlt } from "react-icons/bi";
import CreateComment from "../CreateComment";
import * as PostService from "~/services/PostService";
import { BlankAvatar } from "~/assets";
import { FaEarthAmericas } from "react-icons/fa6";
import { IoPaperPlaneOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { Image, message } from "antd";
import useGetDetailUserById from "~/hooks/useGetDetailUserById";
import { GoBookmarkSlash, GoHeart } from "react-icons/go";
import { BsChat } from "react-icons/bs";
import { useMutationHook } from "~/hooks/useMutationHook";
import ConfirmDialog from "~/components/ConfirmDialog";

const SavedCard = ({ post, onSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [isOpenReply, setIsOpenReply] = useState(false);
  const handleCloseReply = () => setIsOpenReply(false);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const { user } = useGetDetailUserById({ id: post?.userId });
  const [openConfirm, setOpenConfirm] = useState(false);
  const handleCloseConfirm = () => setOpenConfirm(false);
  const handleOpenConfirm = () => {
    setOpenConfirm(true);
    handleClose();
  };
  const renderContentWithHashtags = (content) => {
    if (!content) return "";
    const parts = content.split(/(\s+)/);
    return parts.map((part, index) => {
      if (/^#[A-Za-z0-9_]+$/.test(part)) {
        return (
          <span key={index} className="text-blue cursor-pointer">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const mutation = useMutationHook((data) => PostService.unsave(data));
  const { data, isPending, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      message.destroy();
      onSuccess();
      handleClose();
    }
  }, [isSuccess]);

  const handleUnsave = () => {
    mutation.mutate(post?.id);
  };

  return (
    <div className="bg-primary rounded-xl py-3">
      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        onConfirm={handleUnsave}
        loading={isPending}
        title="Bạn có chắc không"
        description="Bài viết sẽ bị xóa khỏi danh sách lưu"
        variant="danger"
        className="w-[330px]"
      />
      {/* header */}
      <div
        onClick={() => navigate(`/post/${post.id}`)}
        className="flex gap-3 px-5 items-center cursor-pointer"
      >
        {/* avatar */}
        <div className="relative w-14 h-14">
          <img
            onClick={(e) => e.stopPropagation()}
            src={user?.imageUrl ?? BlankAvatar}
            alt="avatar"
            className="w-full h-full object-cover shadow-newFeed bg-no-repeat rounded-full shrink-0"
          />
        </div>

        {/* ten va action */}
        <div className="w-full flex justify-between">
          <div onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 ">
              <Link to={`/profile/${post?.userId}`}>
                <p className="font-semibold text-[15px] leading-[21px] text-ascent-1">
                  {user?.username || "No name"}
                </p>
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[#A4A8AD] text-[15px]">
                {moment(post?.createdDate).fromNow()}
              </span>
              {post?.visibility && post?.visibility === "PRIVATE" && (
                <BiSolidLockAlt size={14} color="#A4A8AD" />
              )}
              {post?.visibility && post?.visibility === "PUBLIC" && (
                <FaEarthAmericas size={14} color="#A4A8AD" />
              )}
            </div>
          </div>

          <div
            className="flex justify-center items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1 rounded-full transition-colors duration-20 hover:bg-gradient-to-r hover:from-bgColor hover:via-from-bgColor hover:to-from-bgColor">
              <BiDotsHorizontalRounded
                size={25}
                color="#686868"
                className="cursor-pointer "
                onClick={handleClick}
                id="demo-customized-button"
                aria-controls={open ? "demo-customized-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                variant="contained"
              />

              <CustomizeMenu
                handleClose={handleClose}
                anchorEl={anchorEl}
                open={open}
                anchor={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={handleOpenConfirm}>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-bgStandard">Unsave</span>
                    <GoBookmarkSlash className="text-bgStandard" />
                  </div>
                </MenuItem>
              </CustomizeMenu>
            </div>
          </div>
        </div>
      </div>

      {/* content */}
      <div className="px-5 mt-1">
        <p className="text-ascent-1 text-sm font-normal leading-[21px]">
          {showAll === post?.id
            ? renderContentWithHashtags(post?.content) || ""
            : renderContentWithHashtags(post?.content?.slice(0, 300)) || ""}

          {post?.content &&
            post.content.length > 301 &&
            (showAll === post?.id ? (
              <span
                className="text-blue ml-2 font-medium cursor-pointer"
                onClick={() => setShowAll(0)}
              >
                {t("Hiển thị ít hơn")}
              </span>
            ) : (
              <span
                className="text-blue ml-2 font-medium cursor-pointer"
                onClick={() => setShowAll(post?.id)}
              >
                {t("Xem thêm")}
              </span>
            ))}
        </p>

        {post?.imageUrl && post?.imageUrl?.length > 0 && (
          <div>
            <Image
              src={post?.imageUrl}
              alt="post image"
              className="w-full mt-2 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {post?.video && (
          <div className="relative">
            <video
              width="100%"
              controls
              className="w-full mt-2 rounded-lg cursor-pointer"
            >
              <source src={post?.video} />
            </video>
          </div>
        )}
      </div>

      {/* action */}
      <div className="flex px-5 mt-2 items-center gap-x-4 text-ascent-2 text-base ">
        {/* like */}
        <div className="flex gap-x-2 items-center hover:scale-105 cursor-pointer transition-transform">
          <GoHeart size={20} />
          <span>{post?.like}</span>
        </div>

        {/* comment */}
        <div className="flex gap-x-2 items-center cursor-pointer hover:scale-105 transition-transform">
          <BsChat
            size={17}
            onClick={() => handleComment(post?.id)}
            className="cursor-pointer"
          />
          <span>{post?.commentCount}</span>
          <CreateComment
            open={isOpenReply}
            handleClose={handleCloseReply}
            id={post?.id}
            comments={post?.comments}
          />
        </div>

        {/* share */}
        <div className="flex gap-2 items-center hover:scale-105 text-base cursor-pointer">
          <IoPaperPlaneOutline size={20} />
          <span>{post?.sharedPost?.length}</span>
        </div>
      </div>

      {/* chan */}
      <div className="border-t border-[#66666645] mt-3"></div>
    </div>
  );
};

export default SavedCard;
