import React, { useState, useRef, useEffect } from "react";
import { IoMdChatbubbles } from "react-icons/io";
import { IoClose, IoSend, IoAttach } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";

const ChatModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey there! How are you?",
      sender: "other",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 2,
      text: "I'm doing great! Thanks for asking.",
      sender: "user",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messageEndRef = useRef(null);
  const modalRef = useRef(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowEmoji(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setShowEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          text: newMessage,
          sender: "user",
          timestamp: new Date().toISOString(),
        },
      ]);
      setNewMessage("");
      setIsTyping(false);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg border-1 border-borderNewFeed shadow-xl w-[350px] h-[500px] flex flex-col animate-slide-up"
        role="dialog"
        aria-label="Chat window"
      >
        <div className="p-4 border-b flex items-center justify-between bg-blue-500 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb"
              alt="User avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="text-white font-semibold">Sarah Johnson</h3>
              <span className="text-green-300 text-sm flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Online
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close chat"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p>{message.text}</p>
                <span className="text-xs opacity-70 block mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>

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
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                setIsTyping(true);
              }}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-full focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
              aria-label="Send message"
            >
              <IoSend className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
