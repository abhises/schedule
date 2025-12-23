"use client";

import { useEffect, useRef, useState } from "react";
import { pusherClient } from "@/lib/pusher-client";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";

type ChatMessage = {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    clerkId: string;
    firstName: string | null;
    imageUrl: string | null;
  };
};

export default function GlobalChat() {
  const { userId: myClerkId, isLoaded } = useAuth();
  const notificationSound = useRef<HTMLAudioElement | null>(null);
  const [sending, setSending] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // -------------------------
  // Auto scroll to bottom
  // -------------------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // -------------------------
  // Fetch + Pusher
  // -------------------------
  useEffect(() => {
    if (!isLoaded || !myClerkId) return;

    fetch("/api/chat/send")
      .then((res) => res.json())
      .then(setMessages);

    const channel = pusherClient.subscribe("global-chat");

    const handler = (message: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });

      const isOtherUser = message.user.clerkId !== myClerkId;

      if (isOtherUser) {
        // 🔔 play sound
        notificationSound.current?.play().catch(() => {});

        // 🔴 increase unread only if chat is closed
        if (!open) {
          setUnread((u) => u + 1);
        }
      }
    };

    channel.bind("new-message", handler);

    return () => {
      channel.unbind("new-message", handler);
      pusherClient.unsubscribe("global-chat");
    };
  }, [isLoaded, myClerkId, open]);

  // -------------------------
  // Send message
  // -------------------------
  async function sendMessage() {
    if (!text.trim() || sending) return;

    try {
      setSending(true);

      await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      setText(""); // UI updates via Pusher
    } catch (err) {
      console.error("Send failed", err);
    } finally {
      setSending(false);
    }
  }

  // -------------------------
  // Time ago
  // -------------------------
  function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} day ago`;
  }

  useEffect(() => {
    notificationSound.current = new Audio("/notification.mp3");
  }, []);

  // -------------------------
  // UI
  // -------------------------
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => {
          setOpen((o) => !o);
          setUnread(0);
        }}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-white shadow-lg hover:bg-blue-700 transition cursor-pointer"
      >
        💬 Chat
        {unread > 0 && (
          <span className="bg-red-500 text-xs px-2 py-0.5 rounded-full">
            {unread}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[380px]
        bg-white shadow-2xl transform transition-transform duration-300
        flex flex-col
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold">Team Chat</span>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-gray-50">
          {messages.map((m) => {
            const isMe = m.user.clerkId === myClerkId;

            return (
              <div
                key={m.id}
                className={`flex items-end gap-2 ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                {!isMe && (
                  <Image
                    src={m.user.imageUrl || "/avatar.png"}
                    alt={m.user.firstName || "User"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}

                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm
                  ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none"
                  }`}
                >
                  {!isMe && (
                    <div className="text-xs font-semibold text-gray-500 mb-1">
                      {m.user.firstName ?? "Unknown"}
                    </div>
                  )}
                  <div>{m.content}</div>
                  <div
                    className={`text-[10px] mt-1 ${
                      isMe ? "text-blue-200 text-right" : "text-gray-400"
                    }`}
                  >
                    {timeAgo(m.createdAt)}
                  </div>
                </div>

                {isMe && (
                  <Image
                    src={m.user.imageUrl || "/avatar.png"}
                    alt="Me"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
              </div>
            );
          })}

          {/* 👇 Scroll anchor */}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t px-3 py-2 bg-white">
          <div className="flex items-center gap-2">
            <input
              disabled={sending}
              className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message…"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button
              onClick={sendMessage}
              disabled={sending}
              className={`rounded-full bg-blue-600 text-white px-4 py-2 text-sm transition cursor-pointer
    ${sending ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"}
  `}
            >
              {sending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending
                </span>
              ) : (
                "Send"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
