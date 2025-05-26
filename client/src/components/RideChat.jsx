import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_REACT_API_URI || "http://localhost:8080/api";
const SOCKET_URL = API_URL.replace("/api", "");

const RideChat = ({ rideId, user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  // Fetch chat history
  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/chat/${rideId}`)
      .then(res => setMessages(res.data?.messages || []))
      .finally(() => setLoading(false));
  }, [rideId]);

  // Setup socket
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current.emit("join", { rideId });

    socketRef.current.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [rideId]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    console.log('Sending message with user ID:', user?._id);

    const msg = {
      sender: user._id,
      text: input,
      timestamp: new Date(),
    };
    // Save to backend
    await axios.post(`${API_URL}/chat/${rideId}`, msg);
    // Emit to socket
    socketRef.current.emit("message", { rideId, message: { ...msg, sender: { _id: user._id, name: user.name, profilePicture: user.profilePicture } } });
    setMessages((prev) => [...prev, { ...msg, sender: { _id: user._id, name: user.name, profilePicture: user.profilePicture } }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-64">
      <div className="flex-1 overflow-y-auto border rounded p-2 bg-muted mb-2">
        {loading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`mb-2 flex ${msg.sender._id === user._id ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs px-3 py-2 rounded-lg ${msg.sender._id === user._id ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}>
                <div className="text-xs font-semibold">{msg.sender.name}</div>
                <div>{msg.text}</div>
                <div className="text-[10px] text-right">{new Date(msg.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>
      <form className="flex gap-2" onSubmit={sendMessage}>
        <input
          type="text"
          className="flex-1 border rounded px-2 py-1"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !input.trim()}>Send</Button>
      </form>
    </div>
  );
};

export default RideChat; 