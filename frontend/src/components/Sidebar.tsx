'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutGrid, MessageCircle, Sparkles } from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Todos', icon: LayoutGrid, note: 'Plan and execute' },
  { href: '/ai', label: 'AI Chat', icon: MessageCircle, note: 'Ask for help fast' },
];

const easeOut = [0.16, 1, 0.3, 1] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ opacity: 0, x: -28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, ease: easeOut }}
      className="sticky top-[5.75rem] hidden h-fit w-[244px] shrink-0 rounded-[30px] border border-[color:var(--border)] bg-[rgba(17,17,24,0.88)] p-5 shadow-soft md:flex md:flex-col"
    >
      <div>
        <p className="kicker">Workspace</p>
        <h2 className="mt-3 text-[1.1rem] font-semibold text-[var(--foreground)]">
          Focus lanes
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
          Everything you need to clear the queue, minus the noise.
        </p>
      </div>

      <nav className="mt-6 space-y-2">
        {links.map(({ href, label, icon: Icon, note }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} className="relative block">
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  transition={{ duration: 0.2, ease: easeOut }}
                  className="absolute inset-0 rounded-2xl border border-[rgba(91,110,245,0.24)] bg-[rgba(91,110,245,0.12)]"
                />
              )}
              <span
                className={`relative flex items-center gap-3 rounded-2xl px-3 py-3 ${
                  active
                    ? 'text-[var(--foreground)]'
                    : 'text-[var(--foreground-muted)] hover:bg-[rgba(24,24,38,0.78)] hover:text-[var(--foreground)]'
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-[rgba(24,24,38,0.82)]">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block text-xs text-[var(--foreground-muted)]">
                    {note}
                  </span>
                </span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[rgba(24,24,38,0.76)] p-4">
        <div className="flex items-center gap-2 text-[var(--foreground)]">
          <Sparkles className="h-4 w-4 text-[var(--primary)]" />
          <span className="text-sm font-semibold">Fast mode</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
          Drag to reprioritize, then let the assistant handle the next move.
        </p>
      </div>
    </motion.aside>
  );
}
