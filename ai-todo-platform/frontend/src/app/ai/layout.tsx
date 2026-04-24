"use client";

import { Sidebar } from "@/components/Sidebar";
import { useHydration } from "@/hooks/use-hydration";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AiLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useHydration();
  const token = useAuthStore((s) => s.token);

  // Auth guard bypassed for testing - AI page is now publicly accessible
  // useEffect(() => {
  //   if (!hydrated) return;
  //   if (!token) router.replace("/login");
  // }, [hydrated, token, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-sm text-rose-600">
        Loading…
      </div>
    );
  }

  // Allow public access for testing
  // if (!token) return null;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl gap-0 md:gap-2">
      <Sidebar />
      <div className="min-w-0 flex-1 p-4 sm:p-6">{children}</div>
    </div>
  );
}
