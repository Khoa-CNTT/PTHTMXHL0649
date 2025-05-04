import { Alerts, CustomizeMenu } from "..";
import { Divider, MenuItem } from "@mui/material";
import { FiBookmark } from "react-icons/fi";
import styled from "@emotion/styled";
import { TbMessageReport } from "react-icons/tb";
import { ImUserMinus } from "react-icons/im";
import { FaRegTrashCan } from "react-icons/fa6";
import { RiAttachment2 } from "react-icons/ri";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import * as UserService from "~/services/UserService";
import * as PostService from "~/services/PostService";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { copyToClipboard } from "~/utils";

const PostMenu = ({ post, button }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useSelector((state) => state.theme.theme);
  const userState = useSelector((state) => state.user);
  const open = Boolean(anchorEl);
  const token = localStorage.getItem("token");
  const [typeMessage, setTypeMessage] = useState("success");
  const [message, setMessage] = useState("");
  const [openMessage, setOpenMessage] = useState(false);
  const [type, setType] = useState("");
  const [icon, setIcon] = useState(null);
  const [duration, setDuration] = useState("");
  const [url, setUrl] = useState("");
  const [user, setUser] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const fetchDetailUser = async ({ id, token }) => {
    const res = await UserService.getDetailUserByUserId({ id, token });
    setUser(res?.result);
  };

  useEffect(() => {
    fetchDetailUser({ id: post?.userId, token });
  }, []);

  const StyledDivider = styled(Divider)(({ theme }) => ({
    borderColor: theme.colorSchemes.light.border,
    margin: `${theme.spacing(0.5)} 0`,
    ...theme.applyStyles("dark", {
      borderColor: theme.colorSchemes.dark.border,
    }),
  }));

  const handleCloseMessage = () => {
    setOpenMessage(false);
  };

  const handleSavePost = async (id) => {
    try {
      handleClose();
      setIcon(<CircularProgress size={20} color="white" />);
      setMessage("Save post...");
      setTypeMessage("warning");
      setOpenMessage(true);
      const res = await PostService.save({ id, token });
      if (res?.code === 400) {
        setDuration(3000);
        setIcon();
        setMessage("Post already saved!");
        setTypeMessage("error");
        setOpenMessage(true);
        return;
      }
      setDuration(3000);
      setIcon();
      setMessage("Save post success!");
      setTypeMessage("success");
      setOpenMessage(true);
    } catch (error) {
      setDuration(3000);
      setIcon();
      setMessage("Something went wrong!");
      setTypeMessage("error");
      setOpenMessage(true);
    }
  };

  const handleDeletePost = async (id) => {
    try {
      handleClose();
      setIcon(<CircularProgress size={20} color="white" />);
      setMessage("Delete post...");
      setTypeMessage("warning");
      setOpenMessage(true);
      const res = await PostService.deletePost({ id, token });
      if (res?.code === 400) {
        setDuration(3000);
        setIcon();
        setMessage("Post already saved!");
        setTypeMessage("error");
        setOpenMessage(true);
        return;
      }
      fetchPosts();
      setDuration(3000);
      setIcon();
      setMessage("Delete post success!");
      setTypeMessage("success");
      setOpenMessage(true);
    } catch (error) {
      setDuration(3000);
      setIcon();
      setMessage("Something went wrong!");
      setTypeMessage("error");
      setOpenMessage(true);
    }
  };

  const handleSaveUrl = (id) => {
    setUrl(`http://localhost:5173/post/${id}`);
    setMessage("Copy to clipboard success!");
    copyToClipboard(url);
    handleClose();
    setType("success");
    setOpenMessage(true);
  };

  return (
    <>
      {button && (
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
      )}

      <Alerts
        type={typeMessage}
        icon={icon}
        duration={duration}
        message={message}
        open={openMessage}
        position={{ vertical: "bottom", horizontal: "center" }}
        handleClose={handleCloseMessage}
      />
      <CustomizeMenu
        handleClose={handleClose}
        anchorEl={anchorEl}
        open={open}
        anchor={{ vertical: "top", horizontal: "right" }}
      >
        {token && (
          <div>
            <MenuItem onClick={() => handleSavePost(post?.id)}>
              <div className="flex items-center justify-between w-full">
                <span className={theme === "light" && "text-black"}>Save</span>
                <FiBookmark color={theme === "light" && "black"} />
              </div>
            </MenuItem>
            <StyledDivider />
            {user?.userId !== post?.userId && (
              <div>
                <MenuItem onClick={handleClose} disableRipple>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-red-600">Report</span>
                    <TbMessageReport color="red" />
                  </div>
                </MenuItem>
                <MenuItem onClick={() => handleClose(post?.id)} disableRipple>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-red-600">Block</span>
                    <ImUserMinus color="red" />
                  </div>
                </MenuItem>
              </div>
            )}
            {userState?.id === post?.userId && (
              <div>
                <MenuItem
                  onClick={() => handleDeletePost(post?.id)}
                  disableRipple
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-red-600">Delete</span>
                    <FaRegTrashCan color="red" />
                  </div>
                </MenuItem>
              </div>
            )}
            <StyledDivider />
          </div>
        )}
        <MenuItem onClick={() => handleSaveUrl(post?.id)}>
          <div className="flex items-center justify-between w-full">
            <span className={theme === "light" && "text-black"}>
              Copy address
            </span>
            <RiAttachment2 color={theme === "light" && "black"} />
          </div>
        </MenuItem>
      </CustomizeMenu>
    </>
  );
};

export default PostMenu;
