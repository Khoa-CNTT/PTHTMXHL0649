import { useDispatch, useSelector } from "react-redux";
import {
  FriendCard,
  ProfileCard,
  TopBar,
  Welcome,
  Group,
  ProfileCardSkeleton,
  FriendCardSkeleton,
  GroupSkeleton,
  PageMeta,
} from "~/components";
import { useTranslation } from "react-i18next";
import { APP_NAME } from "~/utils";
import { BlankAvatar, GroupAvatar } from "~/assets";
import { useEffect, useRef, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import Search from "~/pages/ChatPage/Search";
import { over } from "stompjs";
import SockJs from "sockjs-client/dist/sockjs";
import { searchUser } from "~/redux/Slices/userSlice";
import {
  createChat,
  deleteChat,
  getUsersChat,
  renameGroupChat,
} from "~/redux/Slices/chatSlice";
import {
  createMessage,
  deleteMessage,
  getAllMessages,
} from "~/redux/Slices/messageSlice";
import ChatList1 from "~/pages/ChatPage/ChatList1";
import MessageCard1 from "~/pages/ChatPage/MessageCard1";
import { Plus, ArrowLeft } from "lucide-react";
import CreateGroup from "~/pages/ChatPage/CreateGroup";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile, BsImageFill } from "react-icons/bs";
import { Dropdown, Empty, Spin } from "antd";
import StickerPicker from "~/components/StickerPicker";
import ConfirmDialog from "~/components/ConfirmDialog";

const ChatPage = () => {
  const user = useSelector((state) => state?.user);
  const { t } = useTranslation();
  const isAuthenticated = !!user?.token;
  const [querys, setQuerys] = useState("");
  const [currentChat, setCurrentChat] = useState(null);
  const [content, setContent] = useState("");
  const [isGroup, setIsGroup] = useState(false);
  const dispatch = useDispatch();
  const chat = useSelector((state) => state?.chat);
  const message = useSelector((state) => state?.message);
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const messageContainerRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const fileInputRef = useRef(null);
  const loadingCreateMessage = message?.loadingCreateMessage || false;
  const [showChatList, setShowChatList] = useState(true);
  const [openConfirmDeleteChat, setOpenConfirmDeleteChat] = useState(false);
  const handleCloseConfirmDeleteChat = () => setOpenConfirmDeleteChat(false);
  const [openConfirmDeleteMessage, setOpenConfirmDeleteMessage] =
    useState(false);
  const handleCloseConfirmDeleteMessage = () =>
    setOpenConfirmDeleteMessage(false);
  const isLoadingDeleteChat = chat?.loadingDeleteChat || false;
  const isLoadingDeleteMessage = message?.loadingDeleteMessage || false;
  const handleToggleChatView = () => {
    setShowChatList(!showChatList);
  };

  const handleChatSelect = (chat) => {
    handleCurrentChat(chat);
    // On mobile, switch to chat view when a chat is selected
    if (window.innerWidth < 768) {
      setShowChatList(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 0) {
      const selectedFiles = files.slice(0, 2);
      setSelectedImages(selectedFiles);

      const previews = selectedFiles.map((file) => URL.createObjectURL(file));
      setImagePreview(previews);

      setContent("");
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...selectedImages];
    const newPreviews = [...imagePreview];

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setSelectedImages(newImages);
    setImagePreview(newPreviews);

    if (fileInputRef.current && newImages.length === 0) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAllImages = () => {
    setSelectedImages([]);
    setImagePreview([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  console.log(chat?.chats);

  const handleEmojiClick = (emojiObject) => {
    if (selectedImages.length === 0) {
      setContent((prevContent) => prevContent + emojiObject.emoji);
    }
  };

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const connect = () => {
    const sock = new SockJs("http://localhost:8080/identity/ws");
    const temp = over(sock);
    setStompClient(temp);

    const headers = {
      Authorization: `Bearer ${user?.token}`,
    };

    temp.connect(headers, onConnect);
  };

  const onConnect = () => {
    setIsConnected(true);

    if (stompClient && currentChat) {
      if (currentChat.group) {
        stompClient.subscribe(`/group/${currentChat?.id}`, onMessageReceive);
      } else {
        stompClient.subscribe(`/user/${currentChat?.id}`, onMessageReceive);
      }
    }
  };

  const onMessageReceive = (payload) => {
    const receivedMessage = JSON.parse(payload.body);
    setMessages((prevMessages) => [...prevMessages, receivedMessage]);
  };

  useEffect(() => {
    connect();
  }, []);

  useEffect(() => {
    if (
      isConnected &&
      stompClient &&
      stompClient.connected &&
      currentChat?.id
    ) {
      const subscription = currentChat.group
        ? stompClient.subscribe(`/group/${currentChat.id}`, onMessageReceive)
        : stompClient.subscribe(`/user/${currentChat.id}`, onMessageReceive);

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isConnected, stompClient, currentChat]);

  useEffect(() => {
    if (message.newMessage && stompClient && stompClient.connected) {
      stompClient.send("/app/message", {}, JSON.stringify(message.newMessage));
      setMessages((prevMessages) => [...prevMessages, message.newMessage]);
    }
  }, [message.newMessage, stompClient]);

  useEffect(() => {
    if (message.messages) {
      setMessages(message.messages);
    }
  }, [message.messages]);

  useEffect(() => {
    if (currentChat?.id) {
      dispatch(getAllMessages({ chatId: currentChat.id }));
    }
  }, [currentChat, message.newMessage]);

  useEffect(() => {
    dispatch(getUsersChat({ userId: user?.id }));
  }, [chat?.createdChat, chat?.createdGroup, user]);

  const handleClickOnChatCard = async (userName) => {
    dispatch(createChat({ data: { userName } }));
    setQuerys("");
  };

  const handleSearch = async (keyword) => {
    dispatch(searchUser(keyword));
  };

  const handleCreateNewMessage = () => {
    const hasTextContent = content.trim().length > 0;
    const hasImages = selectedImages.length > 0;

    if (!hasTextContent && !hasImages) return;

    const messageType = hasImages ? "IMAGE" : "TEXT";

    const messageData = {
      chatId: currentChat.id,
      content: hasTextContent ? content.trim() : "",
      type: messageType,
    };

    if (hasImages) {
      messageData.images = selectedImages;
    }

    dispatch(createMessage({ data: messageData }));

    setContent("");
    setShowEmoji(false);
    handleRemoveAllImages();
  };

  const handleCurrentChat = (item) => {
    setCurrentChat(item);
  };

  useEffect(() => {
    chat?.chats &&
      chat?.chats?.forEach((item) => {
        dispatch(getAllMessages({ chatId: item.id }));
      });
  }, [chat?.chats, dispatch]);

  useEffect(() => {
    const prevLastMessages = { ...lastMessages };
    if (message.messages && message.messages.length > 0) {
      message.messages.forEach((msg) => {
        // prevLastMessages[msg.chat.id] = msg;
        prevLastMessages[msg.id] = msg;
      });
      setLastMessages(prevLastMessages);
    }
  }, [message.messages]);

  const renderLeftSidebar = () => (
    <div className="hidden w-1/4 lg:w-1/4 h-full md:flex flex-col gap-6 overflow-y-auto">
      {isAuthenticated ? <ProfileCard user={user} /> : <ProfileCardSkeleton />}
      {isAuthenticated ? <FriendCard /> : <FriendCardSkeleton />}
      {isAuthenticated ? <Group /> : <GroupSkeleton />}
    </div>
  );

  const isSendButtonEnabled =
    (content.trim().length > 0 && selectedImages.length === 0) ||
    (selectedImages.length > 0 && content.trim().length === 0);

  const chatListClasses = `${
    showChatList ? "flex" : "hidden"
  } md:flex md:w-1/3 flex-col overflow-y-auto`;

  const chatContentClasses = `${
    showChatList ? "hidden" : "flex"
  } md:flex md:w-2/3 w-full flex-col h-full`;

  const handleRenameGroup = () => {
    setIsEditingGroupName(true);
    setNewGroupName(currentChat?.chatName || "");
  };

  const handleSaveGroupName = () => {
    if (newGroupName.trim() && currentChat?.id) {
      dispatch(
        renameGroupChat({ groupId: currentChat?.id, groupName: newGroupName })
      ).then(() => {
        setCurrentChat((prev) => ({
          ...prev,
          chatName: newGroupName,
        }));
      });
    }
    setIsEditingGroupName(false);
  };

  const handleCancelRename = () => {
    setIsEditingGroupName(false);
    setNewGroupName("");
  };

  const items = [
    {
      label: (
        <span
          onClick={() => setOpenConfirmDeleteChat(true)}
          className="text-red-600 cursor-pointer"
        >
          Delete chat
        </span>
      ),
      key: "0",
    },
    currentChat?.group &&
      ({
        type: "divider",
      },
      {
        label: <span onClick={handleRenameGroup}>Rename group</span>,
      }),
  ];

  const handleDeleteMessage = (messageId) => {
    dispatch(deleteMessage({ messageId }));
    setMessages(messages.filter((msg) => msg.id !== messageId));
  };

  const handleConfirmDeleteChat = () => {
    if (currentChat?.id) {
      dispatch(deleteChat({ chatId: currentChat.id }));
      setCurrentChat(null);
      handleCloseConfirmDeleteChat();

      if (window.innerWidth < 768) {
        setShowChatList(true);
      }
    }
  };

  return (
    <div>
      <PageMeta
        title={t(`Chat - ${APP_NAME}`)}
        description="Truy cập LinkVerse ngay hôm nay! Kết nối với bạn bè, khám phá nội dung thú vị và chia sẻ khoảnh khắc đáng nhớ. Đăng nhập để bắt đầu hành trình của bạn!"
      />
      <ConfirmDialog
        open={openConfirmDeleteChat}
        onClose={handleCloseConfirmDeleteChat}
        onConfirm={handleConfirmDeleteChat}
        loading={isLoadingDeleteChat}
        title="Bạn có chắc không"
        description="Đoạn chat trên sẽ bị xóa"
        confirmText="Xóa"
        variant="danger"
        className="w-[300px]"
      />

      <div className="w-full lg:px-10 pb-10 2xl:px-50 bg-bgColor h-screen overflow-hidden">
        <TopBar iconBack />
        <Welcome />
        <div className="w-full flex gap-2 pb-8 lg:gap-4 h-full">
          {/* Left */}
          {renderLeftSidebar()}

          {/* Center */}
          <div className="flex-1 h-full bg-primary lg:m-0 flex overflow-hidden rounded-tl-3xl rounded-tr-3xl shadow-newFeed border-1 border-borderNewFeed relative">
            {/* Chat list */}
            <div className={chatListClasses}>
              {isGroup && <CreateGroup setIsGroup={setIsGroup} />}
              {!isGroup && (
                <>
                  <div className="w-full pt-5 px-5 pb-3 flex items-center gap-x-2">
                    <div className="flex-1">
                      <Search
                        querys={querys}
                        setQuerys={setQuerys}
                        handleSearch={handleSearch}
                      />
                    </div>
                    <div className="w-12 h-12 cursor-pointer active:scale-90 hover:scale-105 transition-transform border-1 border-borderNewFeed items-center flex justify-center rounded-full bg-bgSearch">
                      <Plus onClick={() => setIsGroup(true)} />
                    </div>
                  </div>

                  <div className="w-full px-1 flex flex-col items-center gap-y-2">
                    <ChatList1
                      querys={querys}
                      user={user}
                      chat={chat}
                      lastMessages={lastMessages}
                      handleClickOnChatCard={handleClickOnChatCard}
                      handleCurrentChat={handleChatSelect}
                      currentChatId={currentChat?.id}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Chat content */}
            <div className={chatContentClasses}>
              {currentChat?.id ? (
                <>
                  {/* Chat header */}
                  <div className="bg-primary flex justify-between items-center p-5 z-10 shrink-0">
                    <div className="flex items-center justify-center gap-x-2">
                      {/* Back button for mobile */}
                      <button
                        className="md:hidden mr-2 p-1 rounded-full hover:bg-bgSearch"
                        onClick={handleToggleChatView}
                      >
                        <ArrowLeft size={20} />
                      </button>

                      {/* Avatar with overflow container to maintain aspect ratio */}
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={
                            currentChat?.group
                              ? currentChat.chatImage || GroupAvatar
                              : user?.id !== currentChat.users[0]?.id
                              ? currentChat.users[0]?.imageUrl || BlankAvatar
                              : currentChat.users[1]?.imageUrl || BlankAvatar
                          }
                          alt="avatar"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = BlankAvatar;
                          }}
                        />
                      </div>

                      <div className="flex flex-col justify-center">
                        {currentChat?.group ? (
                          isEditingGroupName ? (
                            <div className="flex items-center">
                              <input
                                type="text"
                                value={newGroupName}
                                onChange={(e) =>
                                  setNewGroupName(e.target.value)
                                }
                                required
                                className="px-2 py-1 rounded outline-none border border-borderNewFeed text-base"
                                autoFocus
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveGroupName();
                                  }
                                }}
                              />
                              <button
                                onClick={handleSaveGroupName}
                                className="ml-2 px-2 py-1 bg-blue text-white rounded text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelRename}
                                className="ml-2 px-2 py-1 bg-gray-400 text-white rounded text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <h2 className="font-medium text-base">
                              {currentChat.chatName}
                            </h2>
                          )
                        ) : (
                          <h2 className="font-medium text-base">
                            {user?.id !== currentChat?.users[0]?.id
                              ? currentChat?.users[0]?.username
                              : currentChat?.users[1]?.username}
                          </h2>
                        )}
                        <p className="text-ascent-2 text-sm">
                          {currentChat?.group
                            ? `${currentChat?.users?.length} members`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Dropdown menu={{ items }} trigger={["click"]}>
                        <button className="p-2 rounded-full hover:bg-bgSearch">
                          <FiMoreVertical className="text-ascent-2" />
                        </button>
                      </Dropdown>
                    </div>
                  </div>

                  {/* Chat messages */}
                  <div
                    className="p-5 overflow-y-auto flex-grow"
                    ref={messageContainerRef}
                  >
                    <div className="space-y-2 w-full flex flex-col justify-end items-end py-2">
                      {messages?.length > 0 ? (
                        messages?.map((item, i) => (
                          <MessageCard1
                            key={i}
                            messageId={item?.id}
                            onDelete={handleDeleteMessage}
                            isReqUserMessage={item?.user?.id !== user?.id}
                            content={item.content}
                            timestamp={item.timestamp}
                            profilePic={item?.user?.imageUrl || BlankAvatar}
                          />
                        ))
                      ) : (
                        <div className="w-full h-screen flex flex-col items-center justify-center">
                          <Empty description="Start messaging" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Input area */}
                  <div className="bg-primary p-4 shrink-0">
                    {showEmoji && (
                      <div className="absolute bottom-20 left-0 md:left-auto z-10">
                        <EmojiPicker
                          onEmojiClick={handleEmojiClick}
                          disableSearchBar={false}
                          native
                        />
                      </div>
                    )}

                    {/* Image previews */}
                    {imagePreview.length > 0 && (
                      <div className="flex space-x-2 my-2 mx-2">
                        {imagePreview.map((preview, index) => (
                          <div
                            key={index}
                            className="relative w-20 md:w-32 h-20 md:h-32"
                          >
                            <img
                              src={preview}
                              alt={`Selected ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              onClick={() => handleRemoveImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center bg-bgSearch border-1 border-borderNewFeed rounded-full px-2 md:px-4 py-2 shadow-md">
                      <div className="flex items-center space-x-2 md:space-x-3 mr-1 md:mr-2">
                        <button
                          className={`text-gray-500 hover:text-blue transition-colors ${
                            selectedImages.length > 0
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() =>
                            selectedImages.length === 0 &&
                            setShowEmoji(!showEmoji)
                          }
                          aria-label="Pick emoji"
                          disabled={selectedImages.length > 0}
                        >
                          <BsEmojiSmile className="text-lg md:text-xl" />
                        </button>

                        <label
                          className={`cursor-pointer text-gray-500 hover:text-blue transition-colors ${
                            content.trim().length > 0
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <BsImageFill className="text-lg md:text-xl" />
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            className="hidden"
                            multiple
                            disabled={content.trim().length > 0}
                          />
                        </label>
                        <StickerPicker currentChat={currentChat} />
                      </div>

                      <input
                        type="text"
                        onChange={(e) => setContent(e.target.value)}
                        value={content}
                        disabled={selectedImages.length > 0}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleCreateNewMessage();
                          }
                        }}
                        placeholder={
                          selectedImages.length > 0
                            ? "Can't add text with images"
                            : "Type a message..."
                        }
                        className={`bg-transparent flex-1 outline-none text-ascent-2 py-1 md:py-2 text-sm md:text-base ${
                          selectedImages.length > 0
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      />

                      <button
                        onClick={handleCreateNewMessage}
                        disabled={!isSendButtonEnabled || loadingCreateMessage}
                        className={`ml-1 md:ml-2 p-2 ${
                          !isSendButtonEnabled ? "bg-gray-300" : "bg-rose-500"
                        } text-white rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-colors`}
                      >
                        {loadingCreateMessage ? (
                          <Spin size="small" />
                        ) : (
                          <span>➤</span>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {/* For mobile, add a back button when no chat is selected */}
                  <button
                    className="md:hidden mb-4 p-2 bg-bgSearch rounded-full"
                    onClick={handleToggleChatView}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <Empty description="Select a chat to start messaging" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
