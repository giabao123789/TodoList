"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(251,207,232,0.45),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(249,168,212,0.35),_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(157,23,77,0.25),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(59,7,24,0.5),_transparent_45%)]"
      />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 pb-24 pt-16 text-center sm:pt-24">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-full border border-rose-200/80 bg-white/70 px-4 py-1 text-xs font-medium uppercase tracking-widest text-rose-600 shadow-sm dark:border-rose-800 dark:bg-[#2a2028]/80 dark:text-rose-300"
        >
          AI · Todos · Calm focus
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-rose-950 sm:text-5xl dark:text-rose-50"
        >
          Your todos, gently organized — with{" "}
          <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            AI superpowers
          </span>
          .
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-5 max-w-2xl text-lg text-rose-800/90 dark:text-rose-200/90"
        >
          Break goals into daily tasks, get the next best action, classify
          priority, suggest deadlines, and chat with a productivity coach — in a
          soft pink workspace.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-pink-300/40 transition hover:brightness-105 dark:shadow-none"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-2xl border border-rose-200/90 bg-white/80 px-8 py-3.5 text-sm font-semibold text-rose-900 shadow-sm transition hover:border-pink-300 dark:border-rose-800 dark:bg-[#2a2028] dark:text-rose-50"
          >
            Log in
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-20 grid w-full max-w-3xl gap-4 sm:grid-cols-3"
        >
          {[
            {
              t: "Smart generator",
              d: "Turn “Learn JS in 7 days” into actionable steps.",
            },
            {
              t: "Suggestions",
              d: "Next-task ideas from what you are doing now.",
            },
            {
              t: "Priority + deadlines",
              d: "Let AI classify urgency and propose realistic due dates.",
            },
          ].map((card) => (
            <div
              key={card.t}
              className="rounded-2xl border border-rose-100/90 bg-white/85 p-5 text-left shadow-soft dark:border-rose-900/50 dark:bg-[#231b22]/90"
            >
              <p className="font-semibold text-rose-900 dark:text-rose-100">
                {card.t}
              </p>
              <p className="mt-2 text-sm text-rose-700/90 dark:text-rose-300/90">
                {card.d}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
