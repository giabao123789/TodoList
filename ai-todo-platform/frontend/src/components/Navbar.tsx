'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';

export function Navbar() {
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

  return (
    <header className="sticky top-0 z-40 border-b border-rose-100/80 bg-[#fff1f2]/90 backdrop-blur-md dark:border-rose-900/40 dark:bg-[#1a1418]/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <motion.span
            layoutId="logo"
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-300 to-rose-400 text-sm font-bold text-white shadow-soft"
          >
            ✓
          </motion.span>
          <span className="text-lg font-semibold tracking-tight text-rose-900 dark:text-rose-100">
            BlushTodo
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-2xl border border-rose-200/80 bg-white/70 px-3 py-2 text-sm text-rose-800 shadow-sm transition hover:border-pink-300 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-100"
          >
            Theme
          </button>
          {token ? (
            <>
              <span className="hidden max-w-[12rem] truncate text-sm text-rose-700 dark:text-rose-200 sm:inline">
                {user?.email}
              </span>
              <Link
                href="/dashboard"
                className="rounded-2xl bg-white/80 px-3 py-2 text-sm font-medium text-rose-900 shadow-sm ring-1 ring-rose-200/80 hover:ring-pink-300 dark:bg-rose-950/60 dark:text-rose-50 dark:ring-rose-800"
              >
                Dashboard
              </Link>
              <Link
                href="/ai"
                className="rounded-2xl px-2 py-2 text-sm font-medium text-rose-800 hover:bg-rose-50/80 dark:text-rose-200 dark:hover:bg-rose-950/50 sm:px-3"
              >
                AI
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 px-4 py-2 text-sm font-medium text-white shadow-md shadow-pink-300/40 transition hover:brightness-105 dark:shadow-none"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-2xl px-3 py-2 text-sm font-medium text-rose-800 hover:text-rose-950 dark:text-rose-200"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 px-4 py-2 text-sm font-medium text-white shadow-md shadow-pink-300/40"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
