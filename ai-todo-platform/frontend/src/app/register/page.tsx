import { AuthForm } from "@/components/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center px-4 py-12">
      <AuthForm mode="register" />
    </div>
  );
}
