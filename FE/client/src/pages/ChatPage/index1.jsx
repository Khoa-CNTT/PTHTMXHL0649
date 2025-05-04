import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { over } from "stompjs";
import SockJs from "sockjs-client/dist/sockjs";
import { ImAttachment } from "react-icons/im";
import { BsEmojiSmile, BsMicFill, BsThreeDotsVertical } from "react-icons/bs";
import { AiOutlineSearch } from "react-icons/ai";
import SearchBar from "~/pages/ChatPage/SearchBar";
import { searchUser } from "~/redux/Slices/userSlice";
import ProfileSection from "~/pages/ChatPage/ProfileSection";
import ChatList from "~/pages/ChatPage/ChatList";
import { createChat, getUsersChat } from "~/redux/Slices/chatSlice";
import { createMessage, getAllMessages } from "~/redux/Slices/messageSlice";
import MessageCard from "~/components/MessageCard";
import CreateGroupChat from "~/components/GroupChat/CreateGroupChat";
import { Search, MoreHorizontal, Maximize2, Send } from "lucide-react";

function ChatPage() {
  const [querys, setQuerys] = useState("");
  const [currentChat, setCurrentChat] = useState(null);
  const [content, setContent] = useState("");
  const [isProfile, setIsProfile] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user);
  const chat = useSelector((state) => state?.chat);
  const message = useSelector((state) => state?.message);
  const token = localStorage.getItem("token");
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const messageContainerRef = useRef(null);
  const subscriptionsRef = useRef({});

  // Cleanup function for subscriptions
  const cleanupSubscriptions = useCallback(() => {
    Object.values(subscriptionsRef.current).forEach((subscription) => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    });
    subscriptionsRef.current = {};
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Connect to WebSocket server
  const connect = useCallback(() => {
    try {
      const sock = new SockJs("http://localhost:8080/identity/ws");
      const temp = over(sock);

      // Prevent duplicate messages in console
      temp.debug = null;

      setStompClient(temp);

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      temp.connect(headers, onConnect, onError);
    } catch (error) {
      console.error("Connection error:", error);
      // Implement reconnection logic
      setTimeout(connect, 3000);
    }
  }, [token]);

  const onError = useCallback(
    (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
      cleanupSubscriptions();
      // Attempt to reconnect after error
      setTimeout(connect, 3000);
    },
    [connect, cleanupSubscriptions]
  );

  const onConnect = useCallback(() => {
    setIsConnected(true);
  }, []);

  // Subscribe to individual chat
  const subscribeToChat = useCallback(
    (chatId, isGroupChat) => {
      if (!stompClient || !chatId) return null;

      const chatType = isGroupChat ? "group" : "user";
      const subscriptionKey = `${chatType}-${chatId}`;

      // Avoid duplicate subscriptions
      if (subscriptionsRef.current[subscriptionKey]) {
        return subscriptionsRef.current[subscriptionKey];
      }

      try {
        const subscription = stompClient.subscribe(
          `/${chatType}/${chatId}`,
          onMessageReceive,
          { id: subscriptionKey }
        );

        subscriptionsRef.current[subscriptionKey] = subscription;
        return subscription;
      } catch (error) {
        console.error("Subscription error:", error);
        return null;
      }
    },
    [stompClient]
  );

  // Handle incoming messages
  const onMessageReceive = useCallback((payload) => {
    try {
      const receivedMessage = JSON.parse(payload.body);

      // Only update if it's for the current chat or if we need to update last messages
      if (receivedMessage) {
        setMessages((prevMessages) => {
          // Check if message already exists to prevent duplicates
          const messageExists = prevMessages.some(
            (msg) => msg.id === receivedMessage.id
          );

          if (messageExists) {
            return prevMessages;
          }
          return [...prevMessages, receivedMessage];
        });

        // Update last messages for chat list
        if (receivedMessage.chat && receivedMessage.chat.id) {
          setLastMessages((prev) => ({
            ...prev,
            [receivedMessage.chat.id]: receivedMessage,
          }));
        }
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  }, []);

  // Initial WebSocket connection
  useEffect(() => {
    connect();

    return () => {
      cleanupSubscriptions();
      if (stompClient && stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, [connect, cleanupSubscriptions]);

  // Subscribe to global user topic for notifications
  useEffect(() => {
    if (isConnected && stompClient && user?.id) {
      const userNotificationSubscription = stompClient.subscribe(
        `/user/${user.id}/notification`,
        (notification) => {
          try {
            const data = JSON.parse(notification.body);

            // Handle new message notification by updating lastMessages
            if (data.type === "NEW_MESSAGE") {
              setLastMessages((prev) => ({
                ...prev,
                [data.chatId]: data.message,
              }));

              // Refresh chat list to show the new message
              dispatch(getUsersChat({ userId: user.id }));
            }
          } catch (error) {
            console.error("Error processing notification:", error);
          }
        }
      );

      subscriptionsRef.current["user-notification"] =
        userNotificationSubscription;

      return () => {
        if (userNotificationSubscription) {
          userNotificationSubscription.unsubscribe();
        }
      };
    }
  }, [isConnected, stompClient, user?.id, dispatch]);

  // Subscribe to current chat
  useEffect(() => {
    if (isConnected && stompClient && currentChat?.id) {
      subscribeToChat(currentChat.id, currentChat.isGroupChat);
    }
  }, [isConnected, currentChat?.id, subscribeToChat]);

  // Subscribe to all user chats for real-time updates
  useEffect(() => {
    if (isConnected && stompClient && chat?.chats) {
      // Subscribe to all chats for real-time updates
      chat.chats.forEach((chatItem) => {
        subscribeToChat(chatItem.id, chatItem.isGroupChat);
      });
    }
  }, [isConnected, stompClient, chat?.chats, subscribeToChat]);

  // Send messages directly through WebSocket when possible
  const sendMessage = useCallback(
    (chatId, content) => {
      if (!stompClient || !isConnected || !content.trim() || !chatId) return;

      const messageData = {
        chatId: chatId,
        content: content.trim(),
        senderId: user?.id,
        timestamp: new Date().toISOString(),
      };

      try {
        // Send via WebSocket for immediate delivery
        stompClient.send("/app/message", {}, JSON.stringify(messageData));

        // Also dispatch to Redux for persistence
        dispatch(createMessage({ data: { chatId, content: content.trim() } }));
      } catch (error) {
        console.error("Error sending message:", error);
        // Fallback to HTTP if WebSocket fails
        dispatch(createMessage({ data: { chatId, content: content.trim() } }));
      }
    },
    [stompClient, isConnected, user?.id, dispatch]
  );

  // Handle new message from Redux store
  useEffect(() => {
    if (message.newMessage) {
      setMessages((prevMessages) => {
        // Check if message already exists
        const messageExists = prevMessages.some(
          (msg) => msg.id === message.newMessage.id
        );

        if (messageExists) {
          return prevMessages;
        }
        return [...prevMessages, message.newMessage];
      });
    }
  }, [message.newMessage]);

  // Update messages when loading from API
  useEffect(() => {
    if (message.messages && currentChat?.id) {
      // Compare message arrays to avoid unnecessary updates
      const currentIds = new Set(messages.map((m) => m.id));
      const newMessages = message.messages.filter((m) => !currentIds.has(m.id));

      if (newMessages.length > 0) {
        setMessages((prevMessages) => [...prevMessages, ...newMessages]);
      } else if (message.messages.length > 0 && messages.length === 0) {
        // Initial load case
        setMessages(message.messages);
      }
    }
  }, [message.messages, currentChat?.id]);

  // Fetch messages when changing chats
  useEffect(() => {
    if (currentChat?.id) {
      // Clear messages first to avoid showing previous chat's messages
      setMessages([]);
      dispatch(getAllMessages({ chatId: currentChat.id }));
    }
  }, [currentChat?.id, dispatch]);

  // Fetch user chats
  useEffect(() => {
    if (user?.id) {
      dispatch(getUsersChat({ userId: user.id }));
    }
  }, [chat.createdChat, chat.createdGroup, user?.id, dispatch]);

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickOnChatCard = async (userName) => {
    dispatch(createChat({ data: { userName } }));
  };

  const handleSearch = (keyword) => {
    dispatch(searchUser(keyword));
  };

  const handleCreateNewMessage = () => {
    if (!content.trim() || !currentChat?.id) return;

    sendMessage(currentChat.id, content);
    setContent("");
  };

  const handleCurrentChat = (item) => {
    if (item.id === currentChat?.id) return;
    setCurrentChat(item);
  };

  // Update last messages for each chat
  useEffect(() => {
    if (
      message.messages &&
      message.messages.length > 0 &&
      message.messages[0]?.chat?.id
    ) {
      const chatId = message.messages[0].chat.id;
      const lastMsg = message.messages[message.messages.length - 1];

      if (lastMsg) {
        setLastMessages((prev) => ({
          ...prev,
          [chatId]: lastMsg,
        }));
      }
    }
  }, [message.messages]);

  const handleNavigate = () => {
    setIsProfile(true);
  };

  const handleCreateGroup = () => {
    setIsGroup(true);
  };

  return (
    <div className="relative">
      <div className="w-[100vw] py-14 bg-[#00a884]">
        <div className="flex bg-[#f0f2f5] h-[90vh] absolute top-[5vh] left-[2vw] w-[96vw]">
          {/* Left Sidebar */}
          <div className="left w-[30%] h-full bg-[#e8e9ec]">
            {isGroup && <CreateGroupChat setIsGroup={setIsGroup} />}

            {!isProfile && !isGroup && (
              <div className="w-full">
                <ProfileSection
                  user={user}
                  isProfile={isProfile}
                  isGroup={isGroup}
                  handleNavigate={handleNavigate}
                  handleClick={handleClick}
                  handleCreateGroup={handleCreateGroup}
                  handleClose={handleClose}
                  open={open}
                  anchorEl={anchorEl}
                />
                <SearchBar
                  querys={querys}
                  setQuerys={setQuerys}
                  handleSearch={handleSearch}
                />
                <ChatList
                  querys={querys}
                  user={user}
                  chat={chat}
                  lastMessages={lastMessages}
                  handleClickOnChatCard={handleClickOnChatCard}
                  handleCurrentChat={handleCurrentChat}
                  currentChatId={currentChat?.id}
                />
              </div>
            )}
          </div>

          {/* Chat Area */}
          {currentChat?.id && (
            <div className="w-[70%] relative bg-[#f0f2f5]">
              {/* Chat Header */}
              <div className="header absolute top-0 w-full bg-[#f0f2f5] border-b border-gray-200 z-10">
                <div className="flex justify-between">
                  <div className="py-3 space-x-4 flex items-center px-3">
                    <img
                      className="w-10 h-10 rounded-full"
                      src={
                        currentChat.isGroupChat
                          ? currentChat.chat_image || "/api/placeholder/40/40"
                          : user?.id !== currentChat.users[0]?.id
                          ? currentChat.users[0]?.profile ||
                            "/api/placeholder/40/40"
                          : currentChat.users[1]?.profile ||
                            "/api/placeholder/40/40"
                      }
                      alt="profile"
                    />
                    <p className="font-semibold">
                      {currentChat.isGroupChat
                        ? currentChat.chatName
                        : user?.id !== currentChat.users[0]?.id
                        ? currentChat.users[0]?.name
                        : currentChat.users[1]?.name}
                    </p>
                  </div>
                  <div className="flex py-3 space-x-4 items-center px-3">
                    <AiOutlineSearch className="cursor-pointer text-gray-600" />
                    <BsThreeDotsVertical className="cursor-pointer text-gray-600" />
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div
                className="px-10 h-[85vh] overflow-y-auto pb-16 pt-16"
                ref={messageContainerRef}
              >
                <div className="space-y-1 w-full flex flex-col justify-center py-2">
                  {messages?.length > 0 ? (
                    messages
                      .sort(
                        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                      )
                      .map((item, i) => (
                        <MessageCard
                          key={`${item.id || i}-${item.timestamp}`}
                          isReqUserMessage={item?.user?.id !== user?.id}
                          content={item.content}
                          timestamp={item.timestamp}
                          profilePic={
                            item?.user?.profile || "/api/placeholder/40/40"
                          }
                        />
                      ))
                  ) : (
                    <div className="flex justify-center items-center h-64 text-gray-400">
                      No messages yet. Start a conversation!
                    </div>
                  )}
                </div>
              </div>

              {/* Message Input */}
              <div className="footer bg-[#f0f2f5] absolute bottom-0 w-full py-3 text-2xl border-t border-gray-200">
                <div className="flex justify-between items-center px-5 relative">
                  <BsEmojiSmile className="cursor-pointer text-gray-600 text-xl" />
                  <ImAttachment className="cursor-pointer text-gray-600 text-xl" />

                  <input
                    className="py-2 outline-none border-none bg-white pl-4 rounded-md w-[85%] text-base"
                    type="text"
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type message"
                    value={content}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleCreateNewMessage();
                      }
                    }}
                  />

                  {content.trim() ? (
                    <Send
                      className="cursor-pointer text-gray-600"
                      size={20}
                      onClick={handleCreateNewMessage}
                    />
                  ) : (
                    <BsMicFill className="cursor-pointer text-gray-600 text-xl" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty state when no chat is selected */}
          {!currentChat?.id && (
            <div className="w-[70%] flex items-center justify-center bg-[#f0f2f5]">
              <div className="text-center text-gray-500">
                <div className="mb-4">
                  <img
                    src="/api/placeholder/200/200"
                    alt="Select a chat"
                    className="mx-auto rounded-full opacity-50"
                  />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  Select a chat to start messaging
                </h2>
                <p>
                  Choose from your existing conversations or start a new one
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
