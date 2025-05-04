import React from "react";
import { BlankAvatar, GroupAvatar } from "~/assets";
import ChatCard1 from "~/pages/ChatPage/ChatCard1";
import ChatCardSkeleton from "~/pages/ChatPage/ChatCardSkeleton";

const ChatList1 = ({
  querys,
  user,
  chat,
  lastMessages,
  handleClickOnChatCard,
  handleCurrentChat,
}) => {
  const loadingGetUserChat = chat?.loadingGetUserChat || false;

  const skeletonCount = 5;

  return (
    <div className="bg-primary w-full overflow-y-scroll h-[73vh]">
      {loadingGetUserChat &&
        Array(skeletonCount)
          .fill(0)
          .map((_, index) => <ChatCardSkeleton key={`skeleton-${index}`} />)}

      {/* Search results */}
      {!loadingGetUserChat &&
        querys &&
        user?.searchUser?.map((item, index) => (
          <div key={index} onClick={() => handleClickOnChatCard(item.username)}>
            <ChatCard1
              name={item?.username}
              userImg={item?.imageUrl || BlankAvatar}
              lastMessage={{
                content:
                  lastMessages[item.id]?.content || "Start your conversation",
                timestamp: lastMessages[item.id]?.timestamp || "",
              }}
            />
          </div>
        ))}

      {/* Chat conversations */}
      {!loadingGetUserChat &&
        chat?.chats?.length > 0 &&
        !querys &&
        chat?.chats?.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              handleCurrentChat(item);
            }}
          >
            <ChatCard1
              isChat={!item.group}
              name={
                item.group
                  ? item.chatName
                  : user?.id !== item.users[0]?.id
                  ? item.users[0]?.username
                  : item.users[1]?.username
              }
              userImg={
                item.group
                  ? item.chatImage || GroupAvatar
                  : user?.id !== item.users[0]?.id
                  ? item.users[0]?.imageUrl || BlankAvatar
                  : item.users[1]?.imageUrl || BlankAvatar
              }
              lastMessage={{
                content:
                  lastMessages[item.id]?.content || "Start your conversation",
                timestamp: lastMessages[item.id]?.timestamp || "",
              }}
            />
          </div>
        ))}

      {/* No results message */}
      {!loadingGetUserChat && !querys && chat?.chats?.length === 0 && (
        <div className="flex justify-center items-center h-full text-gray-500">
          No conversations yet
        </div>
      )}
    </div>
  );
};

export default ChatList1;
