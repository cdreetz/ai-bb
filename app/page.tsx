"use client";

import { useState } from "react";
import { Message, continueConversation } from "./actions";

export const maxDuration = 30;

export default function Home() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = { role: "user", content: input };
    setConversation([...conversation, newMessage]);
    setInput("");

    const { messages } = await continueConversation([...conversation, newMessage]);
    setConversation(messages);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded-lg mb-4 h-[calc(100vh-200px)] overflow-y-auto shadow-md">
        {conversation.map((message, index) => (
          <div key={index} className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}>
            <span className={`inline-block p-3 rounded-lg whitespace-pre-wrap ${
              message.role === "user" 
                ? "bg-blue-500 text-black" 
                : "bg-gray-200 text-gray-800"
            }`}>
              {message.content}
            </span>
          </div>
        ))}
      </div>

      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSendMessage();
            }
          }}
          className="text-black flex-grow mr-2 p-3 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-6 py-3 rounded shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );
}
