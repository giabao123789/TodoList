'use client';

import { Sidebar } from '@/components/Sidebar';
import { useHydration } from '@/hooks/use-hydration';

export default function AiLayout({ children }: { children: React.ReactNode }) {
  const hydrated = useHydration();

  if (!hydrated) {
    return (
      <div className="flex min-h-[calc(100vh-5.25rem)] items-center justify-center px-4 py-10 text-sm text-[var(--foreground-muted)]">
        Loading workspace...
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5.25rem)] max-w-[1280px] gap-6 px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <Sidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
