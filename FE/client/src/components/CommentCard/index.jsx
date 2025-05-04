import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BiLike } from "react-icons/bi";
import { BiSolidLike } from "react-icons/bi";
import { BlankAvatar } from "~/assets";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { CustomizeMenu } from "..";
import { BiCommentDetail } from "react-icons/bi";
import { Divider, MenuItem, styled } from "@mui/material";
import { useSelector } from "react-redux";
import { getBase64 } from "~/utils";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoPaperPlaneOutline } from "react-icons/io5";
import { BiDislike, BiSolidDislike } from "react-icons/bi";
import * as PostService from "~/services/PostService";
import CreateComment from "../CreateComment";
import useGetDetailUserById from "~/hooks/useGetDetailUserById";
import { FaRegEdit } from "react-icons/fa";

const CommentCard = ({ comment, isShowImage, postId, onSuccess }) => {
  const theme = useSelector((state) => state.theme.theme);
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(0);
  const [replyComments, setReplyComments] = useState(0);
  const [showComments, setShowComments] = useState(0);
  const [like, setLike] = useState(false);
  const [disLike, setDisLike] = useState(false);
  const [openComment, setOpenComment] = useState(false);
  const { user } = useGetDetailUserById({ id: comment?.userId });
  const [likeCount, setLikeCount] = useState(comment?.like || 0);
  const [dislikeCount, setDislikeCount] = useState(comment?.unlike || 0);

  const handleLike = () => {
    setLike(like === true ? false : true);
  };

  //Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  //preview img
  const imgRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");
  const [openImagePreview, setOpenImagePreview] = useState(false);
  const handleClickImage = () => {
    setImagePreview(imgRef.current.src);
    setOpenImagePreview(true);
  };

  const handleClosePreview = () => {
    setOpenImagePreview(false);
  };

  //comment
  const [isOpenReply, setIsOpenReply] = useState(false);
  const [textReply, setTextReply] = useState("");
  const [file, setFile] = useState(null);
  const [img, setImg] = useState("");
  const [status, setStatus] = useState("public");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  useEffect(() => {
    if (file) {
      getBase64(file)
        .then((result) => setImg(result))
        .catch((error) => console.error(error));
    }
  }, [file]);

  const handleDeleteImg = () => {
    setFile(null);
    setImg("");
  };

  const handleCloseReply = () => {
    setIsOpenReply(false);
  };

  //delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      const res = await PostService.deleteComment({ postId, commentId });
      if (res) {
        onSuccess();
      }
    } catch (error) {}
  };

  return (
    <div className="bg-primary p-2 rounded-xl">
      <div
        onClick={() => navigate(`/post/${post.id}`)}
        className="flex gap-3 items-center mb-2 cursor-pointer"
      >
        <img
          onClick={(e) => e.stopPropagation()}
          src={user?.imageUrl || BlankAvatar}
          alt={"avatar"}
          className="w-14 h-14 flex-shrink-0 object-cover rounded-full"
        />

        <div className="w-full flex justify-between">
          <div onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 ">
              <Link to={`/profile/${comment?.userId}`}>
                <p className="font-medium text-lg text-ascent-1">
                  {user?.username ?? "No name"}
                </p>
              </Link>
              <span className="text-[#A4A8AD] text-sm">
                {moment(comment?.createdDate).fromNow()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div>
                <p className="text-ascent-2">
                  {showAll === comment?.id
                    ? comment?.content || ""
                    : comment?.content?.slice(0, 300) || ""}

                  {comment?.content &&
                    comment.content.length > 301 &&
                    (showAll === comment?.id ? (
                      <span
                        className="text-blue ml-2 font-medium cursor-pointer"
                        onClick={() => setShowAll(0)}
                      >
                        Show less
                      </span>
                    ) : (
                      <span
                        className="text-blue ml-2 font-medium cursor-pointer"
                        onClick={() => setShowAll(comment?.id)}
                      >
                        Show more
                      </span>
                    ))}
                </p>

                {comment?.imageUrl &&
                  comment?.imageUrl?.length > 0 &&
                  !isShowImage && (
                    <div>
                      <img
                        ref={imgRef}
                        onClick={handleClickImage}
                        src={comment?.imageUrl}
                        alt="post image"
                        className="w-full mt-2 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}

                {comment?.video && !isShowImage && (
                  <div className="relative">
                    <video
                      width="100%"
                      controls
                      className="w-full mt-2 rounded-lg cursor-pointer"
                    >
                      <source src={comment?.video} />
                    </video>
                  </div>
                )}
              </div>
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
                <MenuItem onClick={handleClose}>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-red-600">Edit</span>
                    <FaRegEdit className="text-red-600" />
                  </div>
                </MenuItem>
                <MenuItem onClick={() => handleDeleteComment(comment?.id)}>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-red-600">Delete</span>
                    <FaRegTrashCan className="text-red-600" />
                  </div>
                </MenuItem>
              </CustomizeMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center px-3 py-2 text-ascent-2 text-base border-t border-[#66666645]">
        <div className="flex gap-x-3">
          <div className="flex gap-2 items-center hover:scale-105 text-base cursor-pointer ">
            <div className="relative group">
              {like ? (
                <BiSolidLike
                  size={20}
                  onClick={() => handleLike(comment?.id)}
                  className="text-blue-500"
                  color="#0444A4"
                />
              ) : (
                <BiLike size={20} onClick={() => handleLike(comment?.id)} />
              )}
            </div>
            <span>{likeCount}</span>
          </div>

          <div className="flex gap-2 items-center hover:scale-105 text-base cursor-pointer ">
            <div className="relative group">
              {disLike ? (
                <BiSolidDislike
                  size={20}
                  color="#0444A4"
                  onClick={() => handleDisLike(comment?.id)}
                  className="text-blue-500"
                />
              ) : (
                <BiDislike
                  size={20}
                  onClick={() => handleDisLike(comment?.id)}
                />
              )}
            </div>
            <span>{dislikeCount}</span>
          </div>

          <p className="flex gap-2 items-center text-base cursor-pointer hover:scale-105 transition-transform">
            <BiCommentDetail
              size={20}
              onClick={() => handleComment(comment?.id)}
              className="cursor-pointer"
            />
            {comment?.commentCount}
          </p>
          <CreateComment
            open={isOpenReply}
            handleClose={handleCloseReply}
            id={comment?.id}
          />
        </div>
        <div
          onClick={() => handleShare(comment?.id)}
          className="flex gap-2 items-center hover:scale-105 text-base cursor-pointer"
        >
          <IoPaperPlaneOutline size={20} />
          {comment?.sharedPost}
        </div>
      </div>
    </div>
  );
};

export default CommentCard;
