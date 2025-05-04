import { useState, useEffect, useCallback } from "react";
import { Badge } from "@mui/material";
import { GoBell } from "react-icons/go";
import { Link } from "react-router-dom";
import { BlankAvatar } from "~/assets";
import CustomDropDown from "~/components/CustomDropDown/CustomDropDown";
import DropdownItem from "~/components/CustomDropDown/DropDownItem";
import AlertWelcome from "~/components/AlertWelcome";
import { useSelector } from "react-redux";
import SockJS from "sockjs-client";
import { over } from "stompjs";

export default function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [messages, setMessages] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const user = useSelector((state) => state?.user);
  const token = localStorage.getItem("token");

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleClick = useCallback(() => {
    if (user?.token) {
      toggleDropdown();
    } else {
      setOpenAlert(true);
    }
  }, [toggleDropdown, user?.token]);

  const onMessageReceive = useCallback((payload) => {
    const receivedMessage = JSON.parse(payload.body);
    console.log("Received:", receivedMessage);
    setMessages((prev) => [...prev, receivedMessage]);
  }, []);

  const onConnect = useCallback(() => {
    setIsConnected(true);
    if (stompClient && user?.id) {
      stompClient.subscribe(`/user/${user.id}`, onMessageReceive);
    }
  }, [stompClient, user?.id, onMessageReceive]);

  const connectWebSocket = useCallback(() => {
    const socket = new SockJS(`http://localhost:8082/ws`);
    const client = over(socket);
    setStompClient(client);

    const headers = { Authorization: `Bearer ${user?.token}` };
    client.connect(headers, onConnect, (error) => {
      console.error("WebSocket connection error:", error);
    });
  }, [token, user?.token, onConnect]);

  useEffect(() => {
    if (isOpen && !isConnected) {
      connectWebSocket();
    }
  }, [isOpen, isConnected, connectWebSocket]);

  return (
    <div className="relative">
      <AlertWelcome
        type="notifications"
        open={openAlert}
        handleClose={() => setOpenAlert(false)}
      />
      <div className="p-1 flex items-center justify-center">
        <Badge onClick={handleClick} variant="dot" color="warning">
          <GoBell
            size={24}
            className={`text-bgStandard cursor-pointer ${
              isOpen ? "text-neutral-500" : ""
            }`}
          />
        </Badge>
      </div>

      <CustomDropDown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute mt-[17px] flex flex-col rounded-2xl border-1 border-borderNewFeed bg-primary p-2 shadow-theme-lg w-[300px] right-0 h-[380px] md:h-[480px] md:w-[350px] lg:w-[361px]"
      >
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-borderNewFeed md:pb-3 md:mb-3">
          <h5 className="text-base font-semibold text-ascent-1 md:text-lg">
            Notifications
          </h5>
          <button
            onClick={closeDropdown}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M6.22 7.28a.75.75 0 0 1 1.06 0L12 11.94l4.72-4.66a.75.75 0 0 1 1.06 1.06L13.06 13l4.66 4.72a.75.75 0 1 1-1.06 1.06L12 14.06l-4.72 4.66a.75.75 0 0 1-1.06-1.06L10.94 13 6.28 8.28a.75.75 0 0 1 0-1.06z"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <ul className="flex-1 overflow-y-auto custom-scrollbar">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <li key={index}>
                  <DropdownItem
                    onItemClick={closeDropdown}
                    className="flex gap-2 rounded-lg border-b border-borderNewFeed p-2"
                  >
                    <span className="block w-8 h-8 rounded-full overflow-hidden">
                      <img
                        src={msg.avatar || BlankAvatar}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    </span>

                    <span className="flex-1 text-xs md:text-sm">
                      <span className="font-medium">
                        {msg.sender || "User"}
                      </span>{" "}
                      {msg.content || "sent you a notification"}
                      <div className="text-gray-400 text-xs mt-1">
                        {msg.timestamp || "Just now"}
                      </div>
                    </span>
                  </DropdownItem>
                </li>
              ))
            ) : (
              <li className="flex justify-center items-center h-full text-ascent-2 text-sm">
                No notifications yet
              </li>
            )}
          </ul>
          <Link
            to="/"
            className="block text-center text-sm font-medium p-2 mt-2 border border-borderNewFeed rounded-lg text-ascent-1"
          >
            View All Notifications
          </Link>
        </div>
      </CustomDropDown>
    </div>
  );
}
