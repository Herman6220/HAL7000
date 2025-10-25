"use client"

import { ChatProvider } from "@/context/ChatContext";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <div className="w-full">
      <ChatProvider>
        {children}
      </ChatProvider>
    </div>
  );
}
