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
  message: string;
  username: string;
  timestamp: string;
  type: "delta" | "done";
  response: string;
}

interface DisplayMessage {
  id: string; // Unique identifier for grouping messages
  username: string;
  timestamp: string;
  response: string; // Accumulated response for streaming
  isUser: boolean; // Flag to differentiate user vs server messages
}

const Message = ({ socket, username, room }: Props) => {
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [messageList, setMessageList] = useState<DisplayMessage[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sendMessage = async () => {
    if (currentQuestion.trim() !== "") {
      const messageData: DisplayMessage = {
        id: `${username}-${Date.now()}`, // Unique ID for user message
        username,
        timestamp: new Date().toISOString(),
        response: currentQuestion,
        isUser: true,
      };
      await socket.emit("send_message", {
        room,
        message: currentQuestion,
        username,
      });
      setMessageList((prev) => [...prev, messageData]);
      setCurrentQuestion("");
    }
  };

  useEffect(() => {
    // Adjust textarea height dynamically
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }

    // Handle incoming messages
    socket.on("receive_message", (data: Message) => {
      console.log("Received message:", data);
      setMessageList((prev) => {
        const messageId = `${data.username}-${data.message}-${data.timestamp.split("T")[0]}`; // Group by username, message, and date
        if (data.type === "delta") {
          // Find existing server message for streaming
          const existingMessage = prev.find(
            (msg) => msg.id === messageId && !msg.isUser
          );
          if (existingMessage) {
            // Append delta response to existing message
            return prev.map((msg) =>
              msg.id === messageId && !msg.isUser
                ? { ...msg, response: msg.response + data.response }
                : msg
            );
          } else {
            // Create new server message for streaming
            return [
              ...prev,
              {
                id: messageId,
                username: data.username,
                timestamp: data.timestamp,
                response: data.response,
                isUser: false,
              },
            ];
          }
        } else if (data.type === "done") {
          // Replace streaming message with final response
          return [
            ...prev.filter((msg) => msg.id !== messageId || msg.isUser),
            {
              id: messageId,
              username: data.username,
              timestamp: data.timestamp,
              response: data.response,
              isUser: false,
            },
          ];
        }
        return prev;
      });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });

    // Clean up socket listeners on unmount
    return () => {
      socket.off("receive_message");
      socket.off("disconnect");
      socket.off("error");
    };
  }, [socket, currentQuestion]);

  return (
    <div className="w-full h-screen flex flex-col bg-white/10 backdrop-blur-md rounded-xl pt-4 px-4 md:w-1/2">
      <p className="font-bold text-black text-gray-500 text-3xl mb-2">Support</p>

      {/* Message List - takes all available space */}
      <div className="flex-1 overflow-hidden border border-gray-500 rounded-md p-2 mb-2">
        <ScrollToBottom
          className="w-full h-full overflow-x-hidden overflow-y-scroll no-scrollbar"
          scrollViewClassName="flex flex-col"
        >
          {messageList.map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 p-3 rounded-md max-w-[80%] border border-gray-300 bg-white text-black ${
                msg.isUser ? "self-end" : "self-start"
              }`}
            >
              <p className="text-sm font-semibold">{msg.username}</p>
              <p>{msg.response}</p>
              <p className="text-xs text-gray-500">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </ScrollToBottom>
      </div>

      {/* Input - stays pinned at bottom */}
      <div className="flex flex-row items-end p-2 overflow-hidden rounded-md space-x-2 border border-gray-500 hover:border-gray-700">
        <textarea
          ref={textareaRef}
          placeholder="Type here"
          onChange={(e) => setCurrentQuestion(e.target.value)}
          value={currentQuestion}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) return;
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
          className="outline-none bg-transparent flex-1 resize-none min-h-[2.5rem] max-h-[10rem] text-black transition-all"
          style={{
            height: textareaRef.current?.scrollHeight || "auto",
          }}
        />
        <IconSendFill
          onClick={sendMessage}
          className="cursor-pointer w-5 h-5 text-black hover:text-white/70"
        />
      </div>
    </div>
  );
};

export default Message;