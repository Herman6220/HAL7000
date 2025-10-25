"use client"

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface ChatContextProps {
    activeConversationId: string | null;
    setActiveConversationId: Dispatch<SetStateAction<string | null>>;
    messages: Message[];
    setMessages: Dispatch<SetStateAction<Message[]>>
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    return (
    <ChatContext.Provider value={{ activeConversationId, setActiveConversationId, messages, setMessages }}>
      {children}
    </ChatContext.Provider>
    )
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
};