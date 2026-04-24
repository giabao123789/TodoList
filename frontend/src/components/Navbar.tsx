'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  LayoutGrid,
  LogOut,
  MessageCircle,
  MoonStar,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

const easeOut = [0.16, 1, 0.3, 1] as const;

export function Navbar() {
  const pathname = usePathname();
  const { user, token, logout } = useAuthStore();

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    const on = document.documentElement.classList.contains('dark');
    try {
      localStorage.setItem('ai-todo-theme', on ? 'dark' : 'light');
    } catch {
      /* ignore */
    }
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/ai', label: 'AI', icon: MessageCircle },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border)]/90 bg-[rgba(10,10,15,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <motion.span
            layoutId="logo-mark"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/5 bg-[rgba(24,24,38,0.9)] shadow-soft"
            transition={{ duration: 0.2, ease: easeOut }}
          >
            <span className="grid grid-cols-2 gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[4px] bg-[rgba(232,232,240,0.9)]" />
              <span className="h-2.5 w-2.5 rounded-[4px] bg-[rgba(232,232,240,0.28)]" />
              <span className="h-2.5 w-2.5 rounded-[4px] bg-[var(--primary)]" />
              <span className="h-2.5 w-2.5 rounded-[4px] bg-[rgba(232,232,240,0.52)]" />
            </span>
          </motion.span>

          <span className="min-w-0">
            <span className="block truncate text-[1.05rem] font-semibold tracking-[-0.02em] text-[var(--foreground)]">
              AI Todo
            </span>
            <span className="block truncate text-xs text-[var(--foreground-muted)]">
              Focused planning with quiet AI help
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={toggleTheme}
            className="btn-secondary hidden items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium sm:inline-flex"
          >
            <MoonStar className="h-4 w-4" />
            Theme
          </motion.button>

          {token ? (
            <>
              <div className="hidden items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[rgba(17,17,24,0.74)] px-3 py-2 md:flex">
                <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
                <span className="max-w-[14rem] truncate text-sm text-[var(--foreground-muted)]">
                  {user?.email}
                </span>
              </div>

              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium active:scale-[0.97] ${
                      active
                        ? 'border-[rgba(91,110,245,0.22)] bg-[rgba(91,110,245,0.14)] text-[var(--foreground)]'
                        : 'border-[color:var(--border)] bg-[rgba(17,17,24,0.74)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                );
              })}

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => logout()}
                className="btn-secondary inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </motion.button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-secondary inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium active:scale-[0.97]"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="btn-primary inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold active:scale-[0.97]"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
