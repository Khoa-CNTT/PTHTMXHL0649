import React, { useState, useRef, useEffect, useCallback } from "react";
import { Badge } from "@mui/material";
import { IoChatboxEllipsesOutline, IoClose, IoSend } from "react-icons/io5";
import { BsEmojiSmile, BsImageFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { over } from "stompjs";
import SockJs from "sockjs-client/dist/sockjs";
import EmojiPicker from "emoji-picker-react";

// Component imports
import Search from "~/components/Chat/Search";
import ChatList from "~/components/Chat/ChatList";
import MessageCard from "~/components/Chat/MessageCard";
import { CustomizeMenu } from "~/components";

// Redux actions
import { searchUser } from "~/redux/Slices/userSlice";
import { createChat, getUsersChat } from "~/redux/Slices/chatSlice";
import { createMessage, getAllMessages } from "~/redux/Slices/messageSlice";

// Assets
import { BlankAvatar } from "~/assets";
import { useNavigate } from "react-router-dom";
import AlertWelcome from "~/components/AlertWelcome";

const Chat = () => {
  // State management
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user);
  const chat = useSelector((state) => state?.chat);
  const message = useSelector((state) => state?.message);
  const navigate = useNavigate();

  // UI state
  const [openChatList, setOpenChatList] = useState(false);
  const [openChatModal, setOpenChatModal] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [querys, setQuerys] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [openAlertWelcome, setOpenAlertWelcome] = useState(false);

  // Chat state
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [lastMessages, setLastMessages] = useState({});

  // WebSocket state
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Refs
  const messageContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Derived state
  const openMessage = Boolean(anchorEl);
  const currentChatName = useChatName(currentChat, user);
  const currentChatImage = useChatImage(currentChat, user);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // WebSocket connection
  const connect = useCallback(() => {
    try {
      const sock = new SockJs("http://localhost:8080/identity/ws");
      const temp = over(sock);
      setStompClient(temp);

      const headers = {
        Authorization: `Bearer ${user?.token}`,
      };

      temp.connect(headers, onConnect, onError);
    } catch (error) {
      console.error("WebSocket connection error:", error);
    }
  }, [user?.token]);

  const onError = (error) => console.error("WebSocket error:", error);

  const onConnect = useCallback(() => {
    setIsConnected(true);
    subscribeToChat();
  }, []);

  const subscribeToChat = useCallback(() => {
    if (!stompClient || !currentChat) return;

    const topic = currentChat.isGroupChat
      ? `/group/${currentChat.id}`
      : `/user/${currentChat.id}`;

    stompClient.subscribe(topic, onMessageReceive);
  }, [stompClient, currentChat]);

  const onMessageReceive = (payload) => {
    try {
      const receivedMessage = JSON.parse(payload.body);
      setMessages((prevMessages) => [...prevMessages, receivedMessage]);
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  // Connect to WebSocket when chat is opened
  useEffect(() => {
    if (openChatList && !isConnected) {
      connect();
    }
  }, [openChatList, isConnected, connect]);

  // Subscribe to chat when connected and chat changes
  useEffect(() => {
    if (isConnected && stompClient && currentChat?.id) {
      subscribeToChat();
    }
  }, [isConnected, stompClient, currentChat, subscribeToChat]);

  // Update messages when new message is sent
  useEffect(() => {
    if (message.newMessage && stompClient) {
      stompClient.send("/app/message", {}, JSON.stringify(message.newMessage));
      setMessages((prevMessages) => [...prevMessages, message.newMessage]);
    }
  }, [message.newMessage, stompClient]);

  // Update messages when fetched from server
  useEffect(() => {
    if (message.messages) {
      setMessages(message.messages);
    }
  }, [message.messages]);

  // Fetch user chats when chat is opened
  useEffect(() => {
    if (openChatList && user?.id) {
      dispatch(getUsersChat({ userId: user.id }));
    }
  }, [chat.createdChat, chat.createdGroup, openChatList, dispatch, user?.id]);

  // Fetch messages for all chats
  useEffect(() => {
    if (chat?.chats?.length) {
      chat.chats.forEach((item) => {
        dispatch(getAllMessages({ chatId: item.id }));
      });
    }
  }, [chat?.chats, dispatch]);

  // Update last messages for each chat
  useEffect(() => {
    if (message.messages && message.messages.length > 0) {
      const updatedLastMessages = { ...lastMessages };

      message.messages.forEach((msg) => {
        if (msg.chat?.id) {
          updatedLastMessages[msg.chat.id] = msg;
        }
      });

      setLastMessages(updatedLastMessages);
    }
  }, [message.messages]);

  // Event handlers
  const handleOpenChatList = () => setOpenChatList(!openChatList);
  const handleCloseChatList = () => setOpenChatList(false);

  const handleOpenChatModal = (chat) => {
    setCurrentChat(chat);
    setOpenChatModal(true);
    handleCloseChatList();

    // Fetch messages for the selected chat
    if (chat?.id) {
      dispatch(getAllMessages({ chatId: chat.id }));
    }
  };

  const handleCloseChatModal = () => setOpenChatModal(false);

  const handleSearchUser = async (keyword) => {
    dispatch(searchUser(keyword));
  };

  const handleCreateChat = async (userName) => {
    dispatch(createChat({ data: { userName } }));
  };

  const handleSendMessage = () => {
    if (!content.trim()) return;

    dispatch(
      createMessage({
        data: {
          chatId: currentChat.id,
          content: content.trim(),
        },
      })
    );

    setContent("");
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const handleEmojiClick = (emojiObject) => {
    setContent((prevContent) => prevContent + emojiObject.emoji);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChatIconClick = () => {
    if (user?.token) {
      navigate("/chat");
    } else {
      setOpenAlertWelcome(true);
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Render
  return (
    <>
      <AlertWelcome
        type="chat"
        open={openAlertWelcome}
        handleClose={() => setOpenAlertWelcome(!openAlertWelcome)}
      />
      {/* Chat Icon */}
      <div className="p-1 flex items-center justify-center">
        <Badge
          variant="dot"
          color="warning"
          onClick={handleChatIconClick}
          className="cursor-pointer"
        >
          <IoChatboxEllipsesOutline
            size={25}
            aria-controls={openMessage ? "chat-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={openMessage ? "true" : undefined}
            className={`text-bgStandard cursor-pointer transition-colors duration-200 hover:text-blue${
              openMessage && "text-blue"
            }`}
          />
        </Badge>
      </div>

      {/* Chat List Dropdown */}
      <CustomizeMenu
        anchor={{ vertical: "top", horizontal: "center" }}
        handleClose={handleCloseMenu}
        anchorEl={anchorEl}
        open={openMessage}
        styles={{
          marginTop: "10px",
          padding: 0,
          "& .MuiPaper-root": {
            padding: 0,
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
          },
          "&  .MuiPaper-root .MuiMenu-list": { padding: 0 },
        }}
      >
        <div className="w-96 bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 py-4 bg-blue text-white flex justify-between items-center">
            <h2 className="text-xl font-bold">Chats</h2>
            <div className="flex gap-2">
              <button className="text-white hover:text-gray-200 transition-colors">
                <span className="sr-only">New Chat</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 py-2">
            <Search
              querys={querys}
              setQuerys={setQuerys}
              handleSearch={handleSearchUser}
              placeholder="Search users..."
            />
          </div>

          {/* Chat Categories */}
          <div className="bg-gray-100">
            <div className="text-blue px-4 py-2 font-medium">Messages</div>
          </div>

          {/* Chat List */}
          <div className="overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {chat?.loading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue"></div>
              </div>
            ) : (
              <ChatList
                querys={querys}
                user={user}
                chat={chat}
                lastMessages={lastMessages}
                handleClickOnChatCard={handleCreateChat}
                handleCurrentChat={handleOpenChatModal}
              />
            )}
          </div>
        </div>
      </CustomizeMenu>

      {/* Chat Modal */}
      {currentChat?.id && openChatModal && (
        <div className="fixed bottom-4 rounded-lg right-4 z-50">
          <div
            className="bg-white rounded-lg border border-gray-200 shadow-xl w-80 sm:w-96 h-[500px] flex flex-col animate-slide-up"
            role="dialog"
            aria-label="Chat window"
          >
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between bg-blue text-white rounded-t-lg">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    className="w-10 h-10 rounded-full object-cover border-2 border-white"
                    src={currentChatImage}
                    alt="profile"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {currentChatName}
                  </h3>
                  <span className="text-green-200 text-xs flex items-center">
                    Online
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="text-white hover:text-gray-200 transition-colors"
                  aria-label="Close chat"
                  onClick={handleCloseChatModal}
                >
                  <IoClose className="text-2xl" />
                </button>
              </div>
            </div>

            {/* Message List */}
            <div
              ref={messageContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            >
              {messages?.length > 0 ? (
                messages.map((item, i) => (
                  <MessageCard
                    key={i}
                    isReqUserMessage={item?.user?.id !== user?.id}
                    content={item.content}
                    timestamp={item.timestamp}
                    profilePic={item?.user?.imageUrl || BlankAvatar}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <IoChatboxEllipsesOutline size={40} />
                  <p className="mt-2">No messages yet</p>
                  <p className="text-sm">Start a conversation</p>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t bg-white rounded-b-lg">
              {showEmoji && (
                <div className="absolute bottom-16 right-4">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    disableSearchBar={false}
                    native
                  />
                </div>
              )}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-full p-1 pl-3">
                <div className="flex items-center space-x-1">
                  <button
                    className="text-gray-500 hover:text-blue transition-colors"
                    onClick={() => setShowEmoji(!showEmoji)}
                    aria-label="Pick emoji"
                  >
                    <BsEmojiSmile className="text-xl" />
                  </button>
                  <button
                    className="text-gray-500 hover:text-blue transition-colors"
                    aria-label="Attach file"
                  >
                    <BsImageFill className="text-xl" />
                  </button>
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type message..."
                  className="flex-1 bg-transparent p-2 text-sm focus:outline-none"
                />

                <button
                  onClick={handleSendMessage}
                  disabled={!content.trim()}
                  className={`rounded-full p-2 ${
                    content.trim()
                      ? "bg-blue text-white hover:bg-blue"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  } transition-colors`}
                  aria-label="Send message"
                >
                  <IoSend className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Helper hooks
function useChatName(chat, user) {
  if (!chat) return "";

  if (chat.group || chat.isGroupChat) {
    return chat.chatName;
  }

  if (!chat.users || chat.users.length === 0) return "Chat";

  return user?.id !== chat.users[0]?.id
    ? chat.users[0]?.username
    : chat.users[1]?.username;
}

function useChatImage(chat, user) {
  if (!chat) return BlankAvatar;

  if (chat.group || chat.isGroupChat) {
    return chat.chat_image || BlankAvatar;
  }

  if (!chat.users || chat.users.length === 0) return BlankAvatar;

  return user?.id !== chat.users[0]?.id
    ? chat.users[0]?.imageUrl || BlankAvatar
    : chat.users[1]?.imageUrl || BlankAvatar;
}

export default Chat;
