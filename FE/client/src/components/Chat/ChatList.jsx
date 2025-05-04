import React from "react";
import { BlankAvatar } from "~/assets";
import ChatCard from "~/components/Chat/ChatCard";

const ChatList = ({
  querys,
  user,
  chat,
  lastMessages,
  handleClickOnChatCard,
  handleCurrentChat,
}) => {
  return (
    <div className="bg-white overflow-y-scroll h-[73vh] px-3">
      {querys &&
        user?.searchUser?.map((item, index) => (
          <div key={index} onClick={() => handleClickOnChatCard(item.username)}>
            <ChatCard
              name={item?.username}
              userImg={item.imageUrl || BlankAvatar}
              lastMessage={{
                content:
                  lastMessages[item.id]?.content || "Start your conversation",
                timestamp: lastMessages[item.id]?.timestamp || "",
              }}
            />
          </div>
        ))}
      {chat?.chats?.length > 0 &&
        !querys &&
        chat?.chats?.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              handleCurrentChat(item);
            }}
          >
            <hr />
            <ChatCard
              isChat={!item.group}
              name={
                item.group
                  ? item.chatName
                  : user?.id !== item.users[0]?.id
                  ? item.users[0]?.username
                  : item.users[1]?.username
              }
              userImg={item.imageUrl || BlankAvatar}
              lastMessage={{
                content:
                  lastMessages[item.id]?.content || "Start your conversation",
                timestamp: lastMessages[item.id]?.timestamp || "",
              }}
            />
          </div>
        ))}
    </div>
  );
};

export default ChatList;
