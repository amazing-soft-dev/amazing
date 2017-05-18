import { useState } from "react";
import io from "socket.io-client";
import Message from "./components/Message";
import LeftBar from "./components/LeftBar";

const socketChat = io("http://192.168.9.119:3002");
const socketOpenAI = io("http://192.168.9.116:5000");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socketChat.emit("join_room", room);
      socketOpenAI.emit("join_room", room);
      setShowChat(true);
    }
  };

  return (
    <div className="px-8 flex items-center justify-center text-white bg-no-repeat bg-cover w-full h-screen">
      {!showChat ? (
        <div className="w-fit flex flex-col justify-center items-center text-center space-y-2 bg-white/10 backdrop-blur-sm rounded-xl py-8 px-4">
          <h1 className="text-3xl font-bold">Welcome to SocketGram</h1>
          <input
            type="text"
            placeholder="Your nickname"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            className="outline-none text-black p-2 rounded-md overflow-hidden w-[300px] border border-gray-400 hover:border-gray-700"
          />
          <input
            type="text"
            placeholder="Room ID"
            onChange={(e) => setRoom(e.target.value)}
            value={room}
            className="outline-none text-black p-2 rounded-md overflow-hidden w-[300px] border border-gray-400 hover:border-gray-700"
          />
          <button
            onClick={joinRoom}
            className="p-2 bg-blue-500 hover:bg-blue-700 rounded-md font-medium w-[300px]"
          >
            Join a Room
          </button>
        </div>
      ) : (
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-4 p-4 mt-6">
          <LeftBar socket={socketChat} username={username} room={room} />
          <Message socket={socketOpenAI} username={username} room={room} />
        </div>
      )}
    </div>
  );
}

export default App;
