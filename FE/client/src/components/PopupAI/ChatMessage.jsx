import React from "react";
import { FaInfinity } from "react-icons/fa";
import { useSelector } from "react-redux";
import { BlankAvatar } from "~/assets";
import { useTypewriterHook } from "~/hooks/useTypeWriterHook";

const ChatMessage = ({ message, isError }) => {
  const user = useSelector((state) => state?.user);
  const [displayedText] = useTypewriterHook({
    words: [message.text],
    loop: 1,
    typeSpeed: 50,
    deleteSpeed: 0,
    delaySpeed: 1000,
  });

  return (
    <div
      className={`flex ${
        message?.isUser ? "justify-end" : "justify-start"
      } mb-3 max-w-full`}
    >
      {!message?.isUser && (
        <div className="w-8 h-8 mr-1 flex-shrink-0 rounded-full bg-primary shadow-md flex items-center justify-center">
          <FaInfinity className="text-bgStandard" size={20} />
        </div>
      )}
      <div
        className={`py-2 px-3 rounded-lg max-w-[75%] sm:max-w-[80%] break-words ${
          message?.isUser
            ? "bg-message-2 text-ascent-3 rounded-tr-none"
            : isError
            ? "bg-red-100 text-red-500 rounded-tl-none"
            : "bg-message-1 text-ascent-1 rounded-tl-none"
        }`}
      >
        <p className="text-sm sm:text-base">{displayedText}</p>
      </div>
      {message?.isUser && (
        <img
          src={user?.avatar || BlankAvatar}
          alt="User"
          className="w-8 h-8 rounded-full ml-2 flex-shrink-0 object-cover"
        />
      )}
    </div>
  );
};

export default ChatMessage;
