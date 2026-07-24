"use client";

import { useState } from "react";
import type { Message, MessageSender } from "@/lib/mock-data";

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageThread({
  messages,
  viewerSender,
  onSend,
  placeholder = "Type a message…",
}: {
  messages: Message[];
  viewerSender: MessageSender;
  onSend: (text: string) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  }

  return (
    <div className="border border-line bg-paper flex flex-col">
      <div className="flex flex-col gap-3 px-5 py-5 max-h-96 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-ink-soft text-center py-6">
            No messages yet &mdash; say hello!
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender === viewerSender;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 text-sm ${
                  mine ? "bg-moss text-cream" : "bg-cream border border-line text-ink"
                }`}
              >
                <p>{m.text}</p>
                <p
                  className={`text-[10px] mt-1 uppercase tracking-[0.1em] ${
                    mine ? "text-cream/60" : "text-ink-soft"
                  }`}
                >
                  {formatTimestamp(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-line px-4 py-3"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="flex-1 border border-line bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep"
        />
        <button
          type="submit"
          className="bg-ink text-cream px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-moss-deep"
        >
          Send
        </button>
      </form>
    </div>
  );
}
