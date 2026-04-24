import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AI Todo Platform",
    template: "%s - AI Todo Platform",
  },
  description:
    "Dark, refined task management with AI suggestions, prioritization, and chat guidance.",
  openGraph: {
    title: "AI Todo Platform",
    description: "A focused todo workspace with AI-powered planning and suggestions.",
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
