"use client";

import { ChatBox } from "@/components/ChatBox";

export default function AiPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-rose-950 dark:text-rose-50">
          AI assistant
        </h1>
        <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
          Chat is saved per thread. Ask for productivity guidance anytime.
        </p>
      </div>
      <ChatBox />
    </div>
  );
}
