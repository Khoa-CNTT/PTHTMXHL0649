import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile } from "react-icons/bs";
import { IoAttach, IoClose } from "react-icons/io5";
import MessageCard from "~/components/Chat/MessageCard";

const ChatPopup = ({}) => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className="bg-white rounded-lg border-1 border-borderNewFeed shadow-xl w-[350px] h-[500px] flex flex-col animate-slide-up"
        role="dialog"
        aria-label="Chat window"
      >
        <div className="p-4 border-b flex items-center justify-between bg-blue-500 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <img
              className="w-10 h-10 rounded-full"
              src={
                currentChat.group
                  ? currentChat.chat_image || BlankAvatar
                  : user?.id !== currentChat.users[0]?.id
                  ? currentChat.users[0]?.imageUrl || BlankAvatar
                  : currentChat.users[1]?.imageUrl || BlankAvatar
              }
              alt="profile"
            />
            <div>
              <h3 className="text-black font-semibold">
                {currentChat.group
                  ? currentChat.chatName
                  : user?.id !== currentChat.users[0]?.id
                  ? currentChat.users[0].username
                  : currentChat.users[1].username}
              </h3>
              <span className="text-green-300 text-sm flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Online
              </span>
            </div>
          </div>
          <button
            onClick={() => setOpenModal(false)}
            className="text-black hover:text-gray-200 transition-colors"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>

        {/* message card */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages?.length > 0 &&
            messages?.map((item, i) => (
              <MessageCard
                key={i}
                isReqUserMessage={item?.user?.id !== user?.id}
                content={item.content}
                timestamp={item.timestamp}
                profilePic={
                  item?.user?.profile ||
                  "https://media.istockphoto.com/id/521977679/photo/silhouette-of-adult-woman.webp?b=1&s=170667a&w=0&k=20&c=wpJ0QJYXdbLx24H5LK08xSgiQ3zNkCAD2W3F74qlUL0="
                }
              />
            ))}
        </div>

        {/* input */}
        <div className="p-4 border-t relative">
          {showEmoji && (
            <div className="absolute bottom-full right-0 mb-2">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowEmoji(!showEmoji)}
              aria-label="Pick emoji"
            >
              <BsEmojiSmile className="text-xl" />
            </button>
            <button
              className="text-gray-500 hover:text-gray-700"
              aria-label="Attach file"
            >
              <IoAttach className="text-xl" />
            </button>
            <input
              type="text"
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type message"
              value={content}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleCreateNewMessage();
                  setContent("");
                }
              }}
              className="flex-1 p-2 border rounded-full focus:outline-none focus:border-bluePrimary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPopup;
