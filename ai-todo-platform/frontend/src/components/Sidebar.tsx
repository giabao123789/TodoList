'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutGrid, MessageCircle } from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Todos', icon: LayoutGrid },
  { href: '/ai', label: 'AI Chat', icon: MessageCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 flex-col gap-2 border-r border-rose-100/80 bg-white/70 p-4 dark:border-rose-900/50 dark:bg-[#221a20]/80 md:flex">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-rose-400">
        Workspace
      </p>
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} className="relative block">
            {active && (
              <motion.span
                layoutId="nav-pill"
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-200/80 to-rose-200/70 dark:from-pink-900/40 dark:to-rose-900/30"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className={`relative flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? 'text-rose-900 dark:text-rose-50'
                  : 'text-rose-700 hover:bg-rose-50/80 dark:text-rose-200 dark:hover:bg-rose-950/50'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              {label}
            </span>
          </Link>
        );
      })}
    </aside>
  );
}
