import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BlushTodo — AI-powered todo list",
    template: "%s · BlushTodo",
  },
  description:
    "Soft pink productivity app with AI task generation, smart suggestions, and chat coaching.",
  openGraph: {
    title: "BlushTodo",
    description: "AI-powered todos with a calm pink UI.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('ai-todo-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
