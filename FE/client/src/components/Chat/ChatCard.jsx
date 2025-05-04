import {
  Avatar,
  Box,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import { ConversationItem } from "~/components/Chat/styled";

const ChatCard = ({ userImg, name, lastMessage }) => {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(timestamp).toLocaleDateString(undefined, options);
  };
  return (
    <>
      {/* <ConversationItem divider>
        <ListItemAvatar>
          <Avatar src={userImg} sx={{ width: 48, height: 48 }} />
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography variant="subtitle1" fontWeight="600">
              {name}
            </Typography>
          }
          secondary={
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="body2"
                color={1 > 0 ? "primary" : "text.secondary"}
                noWrap
                sx={{ maxWidth: "180px" }}
              >
                {lastMessage ? lastMessage.content : ""}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {lastMessage ? formatTimestamp(lastMessage.timestamp) : ""}
              </Typography>
            </Box>
          }
        />
      </ConversationItem> */}
      <div className="flex items-center p-3 hover:bg-gray-100 cursor-pointer">
        <div className="relative">
          <img src={userImg} alt={name} className="w-12 h-12 rounded-full" />
          {/* {conversation.unread && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          )} */}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between">
            <span className="font-medium text-ascent-1">{name}</span>
            <span className="text-xs text-gray-500">
              {lastMessage ? formatTimestamp(lastMessage.timestamp) : ""}
            </span>
          </div>
          <p
            // className={`text-sm truncate ${
            //   conversation.unread
            //     ? "font-medium text-black"
            //     : "text-gray-500"
            // }`}
            className={`text-sm truncate text-gray-500 `}
          >
            {lastMessage ? lastMessage.content : ""}
          </p>
        </div>
      </div>
    </>
  );
};

export default ChatCard;
