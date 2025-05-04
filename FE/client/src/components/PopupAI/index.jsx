import React, { useState, useRef, useEffect } from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FaArrowLeft, FaInfinity, FaHistory } from "react-icons/fa";
import { MdOutlineDeleteSweep } from "react-icons/md";
import { Dropdown, Modal, List, Button } from "antd";
import ChatMessage from "~/components/PopupAI/ChatMessage";
import * as AIService from "~/services/AIService";
import { TextInput } from "~/components";
import { LuSendHorizontal } from "react-icons/lu";
import { useTranslation } from "react-i18next";

const PopupAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [wasDragging, setWasDragging] = useState(false);
  const [chatPosition, setChatPosition] = useState({ x: 0, y: 0 });
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useTranslation();

  // Chat history state
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatSessions, setChatSessions] = useState({});
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: t("Xin chào! Hôm nay tôi có thể giúp gì cho bạn?"),
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const iconButtonRef = useRef(null);

  // Load chat sessions from localStorage on initial render
  useEffect(() => {
    const storedSessions = localStorage.getItem("chatSessions");
    if (storedSessions) {
      try {
        const parsedSessions = JSON.parse(storedSessions);
        // Convert string timestamps back to Date objects
        Object.keys(parsedSessions).forEach((chatId) => {
          parsedSessions[chatId].messages.forEach((msg) => {
            msg.timestamp = new Date(msg.timestamp);
          });
        });
        setChatSessions(parsedSessions);
      } catch (error) {
        console.error("Error parsing stored chat sessions:", error);
      }
    }

    // Create a new chat session if none exists
    createNewChatSession();
  }, []);

  // Save chat sessions to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(chatSessions).length > 0) {
      localStorage.setItem("chatSessions", JSON.stringify(chatSessions));
    }
  }, [chatSessions]);

  // Update messages when active chat changes
  useEffect(() => {
    if (activeChatId && chatSessions[activeChatId]) {
      setMessages(chatSessions[activeChatId].messages);
    }
  }, [activeChatId]);

  // Create a new chat session
  const createNewChatSession = () => {
    const newChatId = `chat_${Date.now()}`;
    const welcomeMessage = {
      id: 1,
      text: t("Xin chào! Hôm nay tôi có thể giúp gì cho bạn?"),
      isUser: false,
      timestamp: new Date(),
    };

    setChatSessions((prev) => ({
      ...prev,
      [newChatId]: {
        id: newChatId,
        title: `Chat ${Object.keys(prev).length + 1}`,
        createdAt: new Date(),
        messages: [welcomeMessage],
      },
    }));

    setActiveChatId(newChatId);
    setMessages([welcomeMessage]);
    return newChatId;
  };

  // Check if the device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const toggleChat = () => {
    if (wasDragging) {
      setWasDragging(false);
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    e.target.style.height = "40px";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const updateChatSession = (chatId, updatedMessages) => {
    setChatSessions((prev) => {
      // Get the first user message for the title if available
      const firstUserMessage = updatedMessages.find((msg) => msg.isUser);
      let title = prev[chatId].title;

      // If this is the first user message, use it as the title
      if (
        firstUserMessage &&
        prev[chatId].messages.length <= 1 &&
        updatedMessages.length > 1
      ) {
        title =
          firstUserMessage.text.substring(0, 30) +
          (firstUserMessage.text.length > 30 ? "..." : "");
      }

      return {
        ...prev,
        [chatId]: {
          ...prev[chatId],
          messages: updatedMessages,
          title: title,
          updatedAt: new Date(),
        },
      };
    });
  };

  const sendMessage = async () => {
    if (message.trim() === "" || isTyping) return;

    // Create or ensure we have an active chat
    const currentChatId = activeChatId || createNewChatSession();

    const userMessage = {
      id: Date.now(),
      text: message.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    updateChatSession(currentChatId, updatedMessages);

    setMessage("");

    if (chatInputRef.current) {
      chatInputRef.current.style.height = "40px";
    }

    setIsTyping(true);

    try {
      const res = await AIService.ask({ userQuestion: userMessage.text });

      if (res) {
        const botMessage = {
          id: Date.now() + 1,
          text: res,
          isUser: false,
          timestamp: new Date(),
        };
        const newMessages = [...updatedMessages, botMessage];
        setMessages(newMessages);
        updateChatSession(currentChatId, newMessages);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          text: "Xin lỗi, tôi không thể xử lý yêu cầu của bạn. Vui lòng thử lại.",
          isUser: false,
          isError: true,
          timestamp: new Date(),
        };
        const newMessages = [...updatedMessages, errorMessage];
        setMessages(newMessages);
        updateChatSession(currentChatId, newMessages);
      }
    } catch (error) {
      console.error("AI service error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: t("Đã xảy ra lỗi. Vui lòng thử lại sau."),
        isUser: false,
        isError: true,
        timestamp: new Date(),
      };
      const newMessages = [...updatedMessages, errorMessage];
      setMessages(newMessages);
      updateChatSession(currentChatId, newMessages);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    const newMessage = {
      id: Date.now(),
      text: t("Đã xóa lịch sử trò chuyện. Tôi có thể giúp gì cho bạn hôm nay?"),
      isUser: false,
      timestamp: new Date(),
    };

    setMessages([newMessage]);

    if (activeChatId) {
      updateChatSession(activeChatId, [newMessage]);
    } else {
      createNewChatSession();
    }
  };

  const clearAllChats = () => {
    localStorage.removeItem("chatSessions");
    setChatSessions({});
    createNewChatSession();
    setIsHistoryModalOpen(false);
  };

  const deleteChat = (chatId) => {
    setChatSessions((prev) => {
      const newSessions = { ...prev };
      delete newSessions[chatId];
      return newSessions;
    });

    // If we're deleting the active chat, create a new one or switch to another
    if (chatId === activeChatId) {
      const remainingChats = Object.keys(chatSessions).filter(
        (id) => id !== chatId
      );
      if (remainingChats.length > 0) {
        setActiveChatId(remainingChats[0]);
      } else {
        createNewChatSession();
      }
    }
  };

  const switchToChat = (chatId) => {
    setActiveChatId(chatId);
    setIsHistoryModalOpen(false);
  };

  const handleMouseDown = (e) => {
    // Disable dragging on mobile devices
    if (isMobile) return;

    if ((isOpen && e.target.closest(".drag-handle")) || !isOpen) {
      setIsDragging(true);
      setWasDragging(false); // Reset this at start of potential drag
      setDragStartPosition({
        x: e.clientX - chatPosition.x,
        y: e.clientY - chatPosition.y,
      });

      iconButtonRef.current = {
        originalX: e.clientX,
        originalY: e.clientY,
      };

      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStartPosition.x;
    const newY = e.clientY - dragStartPosition.y;

    const hasMoved =
      Math.abs(e.clientX - iconButtonRef.current.originalX) > 5 ||
      Math.abs(e.clientY - iconButtonRef.current.originalY) > 5;

    if (hasMoved) {
      setWasDragging(true);
    }

    setChatPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStartPosition]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && chatInputRef.current) {
      setTimeout(() => {
        chatInputRef.current.focus();
      }, 300);
    }
  }, [isOpen]);

  const dropdownItems = [
    {
      key: "1",
      label: (
        <div className="flex items-center gap-2" onClick={clearChat}>
          <span>{t("Xoá cuộc trò chuyện")}</span>
          <MdOutlineDeleteSweep size={18} />
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div
          className="flex items-center gap-2"
          onClick={() => setIsHistoryModalOpen(true)}
        >
          <span>{t("Lịch sử trò chuyện")}</span>
          <FaHistory size={16} />
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div className="flex items-center gap-2" onClick={createNewChatSession}>
          <span>{t("Cuộc trò chuyện mới")}</span>
          <span>+</span>
        </div>
      ),
    },
  ];

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <>
      <div
        className={`fixed z-50 flex flex-col items-end ${
          isMobile ? "bottom-0 right-0 left-0" : "bottom-5 right-5"
        }`}
        style={{
          transform: isMobile
            ? "none"
            : `translate(${chatPosition.x}px, ${chatPosition.y}px)`,
          transition: isDragging ? "none" : "transform 0.2s ease",
        }}
      >
        {isOpen ? (
          <div
            ref={chatContainerRef}
            className={`bg-white shadow-2xl rounded-3xl transition-all duration-300 overflow-hidden border-1 border-borderNewFeed ${
              isMobile
                ? "w-full h-[100vh] fixed inset-0 rounded-none"
                : "w-80 sm:w-96"
            }`}
            style={{
              opacity: isDragging ? 0.7 : 1,
              transform: `scale(${isDragging ? 0.98 : 1})`,
              transition: "all 0.2s ease",
            }}
          >
            {/* Chat Header */}
            <div
              className={`bg-gradient-to-r from-slate-300 to-stone-800 text-white p-3 flex justify-between items-center ${
                isMobile
                  ? "rounded-none"
                  : "rounded-tl-3xl rounded-tr-3xl drag-handle cursor-move"
              }`}
              onMouseDown={!isMobile ? handleMouseDown : undefined}
            >
              <div className="flex items-center gap-x-2">
                <button
                  onClick={toggleChat}
                  className="text-white p-1 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Close chat"
                >
                  <FaArrowLeft size={16} />
                </button>
                <div className="flex gap-x-2 items-center">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <FaInfinity className="text-bgStandard" size={20} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-semibold">LinkVerse Bot</h3>
                    <p className="text-xs text-ascent-2">{t("Trợ lý AI")}</p>
                  </div>
                </div>
              </div>
              <Dropdown
                trigger={["click"]}
                placement="bottomRight"
                menu={{ items: dropdownItems }}
              >
                <button
                  className="text-white p-1 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Menu options"
                >
                  <HiOutlineDotsVertical size={20} />
                </button>
              </Dropdown>
            </div>

            {/* Chat Messages */}
            <div
              className={`overflow-y-auto p-3 bg-primary ${
                isMobile ? "h-[calc(100vh-136px)]" : "h-96"
              }`}
            >
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} isError={msg.isError} />
              ))}

              {isTyping && (
                <div className="flex items-start space-x-2 mb-4">
                  <div className="w-8 h-8 rounded-full shadow-md bg-primary flex items-center justify-center">
                    <FaInfinity className="text-bgStandard" size={20} />
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm max-w-[80%]">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "200ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "400ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
              className={`p-3 border-t border-borderNewFeed bg-primary ${
                isMobile ? "rounded-none" : "rounded-bl-3xl rounded-br-3xl"
              }`}
            >
              <TextInput
                ref={chatInputRef}
                value={message}
                disabled={isTyping}
                onChange={handleMessageChange}
                onKeyDown={handleKeyDown}
                styles="w-full rounded-2xl bg-primary"
                placeholder={t("Hỏi bất cứ điều gì...")}
                iconRight={<LuSendHorizontal size={18} onClick={sendMessage} />}
                iconRightStyles="mr-1 cursor-pointer"
              />
              {!isMobile && (
                <div
                  onMouseDown={handleMouseDown}
                  className="drag-handle cursor-move text-center mt-2"
                >
                  <span className="text-xs text-ascent-2 font-semibold">
                    {t("Được hỗ trợ bởi LinkVerse")}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            ref={(el) => {
              if (el && !iconButtonRef.current) {
                iconButtonRef.current = {};
              }
            }}
            onClick={toggleChat}
            onMouseDown={!isMobile ? handleMouseDown : undefined}
            className={`group ${isDragging ? "" : "animate-bounce"} ${
              isMobile ? "mb-4 mr-4" : ""
            }`}
            style={{
              cursor: isDragging ? "grabbing" : "pointer",
            }}
          >
            <img
              src="/robot.gif"
              alt="chatbot"
              className={`${
                isMobile ? "w-14 h-14" : "w-16 h-16"
              } shadow-xl rounded-full border border-borderNewFeed bg-primary transition-transform group-hover:scale-110`}
            />
          </button>
        )}
      </div>

      {/* Chat History Modal */}
      <Modal
        title={t("Lịch sử trò chuyện")}
        open={isHistoryModalOpen}
        onCancel={() => setIsHistoryModalOpen(false)}
        footer={[
          <Button key="new" type="primary" onClick={createNewChatSession}>
            {t("Cuộc trò chuyện mới")}
          </Button>,
          <Button key="clear" danger onClick={clearAllChats}>
            {t("Xoá tất cả")}
          </Button>,
        ]}
      >
        <List
          dataSource={Object.values(chatSessions).sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt) -
              new Date(a.updatedAt || a.createdAt)
          )}
          renderItem={(session) => (
            <List.Item
              className={`cursor-pointer hover:bg-gray-100 rounded-md p-2 ${
                session.id === activeChatId ? "bg-blue-50" : ""
              }`}
              onClick={() => switchToChat(session.id)}
              actions={[
                <Button
                  key="delete"
                  danger
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(session.id);
                  }}
                >
                  {t("Xoá")}
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={session.title}
                description={formatDate(session.updatedAt || session.createdAt)}
              />
            </List.Item>
          )}
          locale={{ emptyText: t("Không có cuộc trò chuyện nào") }}
        />
      </Modal>
    </>
  );
};

export default PopupAI;
