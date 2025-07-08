import React, { useState } from "react";
import { HiChat, HiX, HiPaperAirplane, HiShieldExclamation } from "react-icons/hi";

export function SecurityChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ text: string; sender: "user" | "support" }>>([
    {
      text: "Hello! I'm here to help with any security concerns or issues. How can I assist you today?",
      sender: "support",
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Add user message
      setMessages((prev) => [...prev, { text: message, sender: "user" }]);
      
      // Simulate support response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "Thank you for reporting this security concern. Our security team has been notified and will review your submission promptly. You can also email us at security@verita.ai for urgent matters.",
            sender: "support",
          },
        ]);
      }, 1000);
      
      setMessage("");
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-brand text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 group"
        aria-label="Open security chat"
      >
        {isOpen ? (
          <HiX className="h-6 w-6" />
        ) : (
          <div className="relative">
            <HiShieldExclamation className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-brand-danger rounded-full animate-pulse"></span>
          </div>
        )}
        <span className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Report Security Issue
        </span>
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-brand-borderLight z-50 flex flex-col animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-brand text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <HiShieldExclamation className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Security Support</h3>
                  <p className="text-xs opacity-90">Report security issues</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <HiX className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    msg.sender === "user"
                      ? "bg-gradient-brand text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-brand-borderLight">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your security concern..."
                className="flex-1 px-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
              />
              <button
                type="submit"
                className="bg-gradient-brand text-white p-2 rounded-lg hover:shadow-md transition-all duration-200"
              >
                <HiPaperAirplane className="h-5 w-5 transform rotate-90" />
              </button>
            </div>
            <p className="text-xs text-brand-muted mt-2">
              For urgent security issues, email{" "}
              <a href="mailto:security@verita.ai" className="text-brand-primary hover:underline">
                security@verita.ai
              </a>
            </p>
          </form>
        </div>
      )}
    </>
  );
}