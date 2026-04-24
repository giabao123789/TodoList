"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ChatBox } from "@/components/ChatBox";

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function AiPage() {
  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: easeOut }}
        className="surface-panel relative overflow-hidden rounded-[32px] px-6 py-7 sm:px-8 sm:py-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(91,110,245,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(91,110,245,0.08),transparent_34%)]"
        />
        <div className="relative">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--primary)]" />
            <p className="kicker">AI Assistant</p>
          </div>
          <h1 className="mt-4 max-w-2xl text-[clamp(2rem,1.85rem+0.85vw,2.7rem)] leading-[1.04]">
            Planning support without the clutter.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--foreground-muted)] sm:text-base">
            Chats stay attached to their own threads, so you can ask for sequencing,
            focus advice, or a faster plan without losing context.
          </p>
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: easeOut, delay: 0.05 }}
      >
        <ChatBox />
      </motion.div>
    </div>
  );
}
