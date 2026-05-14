"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

// ─── Bento card ──────────────────────────────────────────────────────────────
function BentoCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={"rounded-2xl border border-gray-200 bg-white " + className}>
      {children}
    </div>
  );
}

// ─── Pill tag ─────────────────────────────────────────────────────────────────
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs tracking-widest font-sans text-gray-600 bg-gray-100">
      {children}
    </span>
  );
}

function createHomeConfetti() {
  const colors = ["#F97316", "#EF4444", "#F59E0B", "#10B981", "#6EE7B7"];
  const shapes = ["◆", "●", "▲", "★", "✦"];
  return Array.from({ length: 140 }).map((_, index) => {
    const angle = Math.random() * Math.PI * 1.2 - Math.PI * 0.6;
    const speed = Math.random() * 180 + 140;
    const x = Math.cos(angle) * speed;
    const y = Math.sin(angle) * speed + 140;
    const size = Math.round(Math.random() * 10 + 12);
    return {
      id: `home-confetti-${index}`,
      left: `${Math.random() * 90 + 5}%`,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      color: colors[index % colors.length],
      style: {
        "--confetti-x": `${x}px`,
        "--confetti-y": `${y}px`,
        "--confetti-rot": `${Math.random() * 360}deg`,
        animationDelay: `${Math.random() * 1200}ms`,
        animationDuration: `${Math.random() * 2 + 4}s`,
        fontSize: `${size}px`,
        lineHeight: 1,
      } as React.CSSProperties,
    };
  });
}

export default function HomePage() {
  const [confetti, setConfetti] = useState<Array<{ id: string; left: string; shape: string; color: string; style: React.CSSProperties }>>([]);

  useEffect(() => {
    setConfetti(createHomeConfetti());
    const interval = window.setInterval(() => {
      setConfetti(createHomeConfetti());
    }, 4200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="relative bg-amber-50 text-gray-900 min-h-screen font-sans antialiased">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confetti.map((piece) => (
          <span
            key={piece.id}
            className="confetti-piece home-confetti-piece"
            style={{
              ...piece.style,
              left: piece.left,
              color: piece.color,
            }}
          >
            {piece.shape}
          </span>
        ))}
      </div>
      <div className="max-w-6xl mx-auto px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-10 items-center">
          <div className="col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-xs uppercase tracking-wider text-gray-600">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              Focused task control
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl md:text-6xl lg:text-8xl leading-tight font-light">
              A quieter dashboard for getting work done.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
              Capture tasks quickly, reorder them as priorities change, and let AI step in only when you need a faster plan.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/register" className="btn-primary inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold active:scale-95">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="btn-secondary inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold active:scale-95">
                Log in
              </Link>
            </div>

            <div className="mt-12">
              <Tag>FEATURES</Tag>
              <div className="mt-5 grid grid-cols-12 gap-3">
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
                  <BentoCard key={feature.title} className="col-span-4 p-5">
                    <p className="text-sm font-semibold text-gray-900">{feature.title}</p>
                    <p className="mt-3 text-sm leading-6 text-gray-600">{feature.description}</p>
                  </BentoCard>
                ))}
              </div>
            </div>
          </div>
          <div className="col-span-5">
            <BentoCard className="p-6">
              <Tag>PREVIEW</Tag>
              <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">This week</p>
                    <p className="mt-1 text-sm text-gray-600">A clear queue with just enough AI support.</p>
                  </div>
                  <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-900">12 tasks</span>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    ["Finalize launch copy", "high"],
                    ["Send partner update", "medium"],
                    ["Review QA notes", "low"],
                  ].map(([title, priority]) => (
                    <div key={title} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">{title}</span>
                      <span className="rounded-full border border-gray-200 px-2.5 py-1 text-xs capitalize text-gray-600">{priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </main>
  );
}
