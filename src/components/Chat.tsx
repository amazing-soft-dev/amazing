import { useEffect, useState, useRef } from "react";
import { Socket } from "socket.io-client";
import ScrollToBottom from "react-scroll-to-bottom";

import IconSendFill from "./IconSendFill";

interface Props {
  socket: Socket;
  username: string;
  room: string;
}

interface Message {
  room: string;
  id: string | undefined;
  author: string;
  message: string;
  time: string;
}

const Chat = ({ socket, username, room }: Props) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState<Message[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = async () => {
    if (currentMessage.trim() !== "") {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeString = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;

      const message: Message = {
        room,
        id: socket.id,
        author: username,
        message: currentMessage,
        time: timeString,
      };
      setMessageList((prev) => [...prev, message]);
      await socket.emit("send_message", message);
      setCurrentMessage("");
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [currentMessage]);

  useEffect(() => {
    socket.on("receive_message", (data: Message) => {
      setMessageList((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket]);

  return (
    <div className="w-full bg-white/10 backdrop-blur-md rounded-xl pt-4 px-4 pb-2">
      <p className="font-bold text-black text-gray-500 text-3xl mb-2">Chat</p>

      <div className="flex flex-col-reverse h-[80vh] border border-gray-500 rounded-md overflow-hidden p-2 mb-2">
        {/* Input Area */}
        <div className="flex flex-row items-end p-2 overflow-hidden rounded-md space-x-2 border border-gray-500 hover:border-gray-700 bg-white/30">
          <textarea
            ref={textareaRef}
            placeholder="Type here"
            onChange={(e) => setCurrentMessage(e.target.value)}
            value={currentMessage}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.shiftKey) return;
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="outline-none bg-transparent flex-1 resize-none min-h-[2.5rem] max-h-[10rem] text-black transition-all"
            style={{
              height: textareaRef.current?.scrollHeight || "auto"
            }}
          />
          <IconSendFill
            onClick={sendMessage}
            className="cursor-pointer w-5 h-5 text-black hover:text-white/70"
          />
        </div>

        {/* Message List */}
        <ScrollToBottom
          className="w-full h-full overflow-x-hidden overflow-y-scroll no-scrollbar"
          scrollViewClassName="flex flex-col"
        >
          {messageList.map((message, index) => (
            <div
              key={index}
              className={`flex flex-col p-2.5 mb-2 rounded-lg w-[70%] sm:w-80 text-black border border-gray-400 ${
                message.id === socket.id
                  ? "bg-gray-200 self-end"
                  : "bg-gray-100 self-start"
              }`}
            >
              <p className="font-bold">{message.author}</p>
              <p className="whitespace-pre-wrap">{message.message}</p>
              <p className="text-sm font-light text-end">{message.time}</p>
            </div>
          ))}
        </ScrollToBottom>
      </div>
    </div>
  );
};

export default Chat;