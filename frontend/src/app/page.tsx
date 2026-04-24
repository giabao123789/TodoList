"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function HomePage() {
  return (
    <main className="mx-auto max-w-[1280px] px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: easeOut }}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[rgba(17,17,24,0.7)] px-4 py-2 text-xs uppercase tracking-[0.14em] text-[var(--foreground-muted)]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
            Focused task control
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, ease: easeOut, delay: 0.05 }}
            className="mt-6 max-w-3xl text-[clamp(2.8rem,2.3rem+2vw,4.8rem)] leading-[0.96]"
          >
            A quieter dashboard for getting work done.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, ease: easeOut, delay: 0.1 }}
            className="mt-5 max-w-2xl text-base leading-7 text-[var(--foreground-muted)] sm:text-lg"
          >
            Capture tasks quickly, reorder them as priorities change, and let AI
            step in only when you need a faster plan.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, ease: easeOut, delay: 0.15 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/register"
              className="btn-primary inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold active:scale-[0.97]"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="btn-secondary inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold active:scale-[0.97]"
            >
              Log in
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, ease: easeOut, delay: 0.2 }}
            className="mt-12 grid gap-4 sm:grid-cols-3"
          >
            {[
              {
                title: "Smart generation",
                description: "Turn a goal into a realistic task list without losing control of the details.",
              },
              {
                title: "Priority help",
                description: "Use AI to classify urgency, sequence the next move, and suggest a due date.",
              },
              {
                title: "Fast chat",
                description: "Keep planning conversations in their own threads so context stays intact.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="surface-panel rounded-[28px] p-5"
              >
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {feature.title}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: easeOut, delay: 0.1 }}
          className="surface-panel relative overflow-hidden rounded-[34px] p-6 sm:p-7"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(91,110,245,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(91,110,245,0.08),transparent_34%)]"
          />

          <div className="relative">
            <p className="kicker">Preview</p>
            <div className="mt-4 rounded-[28px] border border-[color:var(--border)] bg-[rgba(17,17,24,0.76)] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    This week
                  </p>
                  <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                    A clear queue with just enough AI support.
                  </p>
                </div>
                <span className="rounded-full border border-[rgba(91,110,245,0.24)] bg-[rgba(91,110,245,0.12)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
                  12 tasks
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  ["Finalize launch copy", "high"],
                  ["Send partner update", "medium"],
                  ["Review QA notes", "low"],
                ].map(([title, priority]) => (
                  <div
                    key={title}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--border)] bg-[rgba(24,24,38,0.74)] px-4 py-3"
                  >
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {title}
                    </span>
                    <span className="rounded-full border border-[color:var(--border)] px-2.5 py-1 text-xs capitalize text-[var(--foreground-muted)]">
                      {priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
