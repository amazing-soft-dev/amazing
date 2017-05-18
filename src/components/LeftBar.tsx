import { useEffect, useState, useRef } from "react";
import { Socket } from "socket.io-client";
import Chat from "./Chat";
import SystemSetting from "./SystemSetting";

interface Props {
  socket: Socket;
  username: string;
  room: string;
}

const LeftBar = ({ socket, username, room }: Props) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [currentMessage]);

  return (
    <div className="hidden md:block w-full md:w-1/2 bg-white/10 backdrop-blur-md rounded-xl pb-8 pt-4 px-4">
      <SystemSetting systemSetting="I'm a senior software engineer" />
      <Chat socket={socket} username={username} room={room} />
    </div>
  );
};

export default LeftBar;