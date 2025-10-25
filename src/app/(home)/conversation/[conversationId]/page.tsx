"use client"

import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessages } from "@/components/ChatMessages";
import { DEFAULT_LIMIT } from "@/constants";

interface Message {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export default function Home() {

  const [messages, setMessages] = useState<Message[]>([]);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [thinking, setThinking] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const { conversationId } = useParams();
  const router = useRouter();
  const aiMessageRef = useRef("");
  const [hasMore, setHasMore] = useState(true);

  const fetchMessageForConversation = async () => {
    if (!conversationId) {
      return;
    }
    setIsFetchingNextPage(true);
    try {
      const before = messages[0]?.createdAt ?? "";
      const response = await fetch(`/api/conversationMessages?conversationId=${conversationId}&before=${before}&limit=${DEFAULT_LIMIT}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })

      if (response.status === 401) {
        router.push("/conversation");
      }

      if (response.status === 404) {
        setHasMore(false);
        return;
      }

      if (!response.ok) {
        console.log("Could not get previous messages for this chat.");
      }

      const result = await response.json();
      const reversedMessages = result.message.reverse();
      setMessages(prev => [...reversedMessages, ...prev]);
    } catch (error) {
      console.log("Something went wrong", error);
    } finally {
      setIsFetchingNextPage(false);
    }
  }

  const handleSend = useCallback(async (messageToSend: string) => {

    if (!messageToSend.trim()) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: "user", content: messageToSend, createdAt: new Date().toISOString() },
      { role: "assistant", content: "", createdAt: new Date().toISOString() },
    ]);

    const callServer = async (userInput: string) => {
      setThinking(true);
      aiMessageRef.current = "";

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ message: userInput, conversationId: conversationId })
        })

        let aiMessage = "";

        if (!response.ok) {
          console.log("Error");
        }

        const reader = response.body!.getReader()
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n\n").filter(line => line.startsWith("data: "));

          for (const line of lines) {
            const data = JSON.parse(line.slice(6));
            aiMessage += data.content || "";
            // console.log(aiMessage);

            setMessages((prev) => {
              const updated = [...prev];
              if (updated[updated.length - 1].role === "assistant") {
                updated[updated.length - 1].content = aiMessage;
              }
              return updated;
            })

          }
        }
      } catch (error) {
        console.log("Something went wrong", error);
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[updated.length - 1].role === "assistant") {
            updated[updated.length - 1].content = "Error";
          }
          return updated;
        })
      } finally {
        setThinking(false);
      }
    }

    await callServer(messageToSend);
  }, [conversationId])

  return (
    <>
      <div className="w-full min-h-[80vh] h-full">
        <div className="max-w-3xl w-full mx-auto text-white pt-4 pb-50 md:px-0 md:text-base text-sm px-2 flex flex-col gap-4" ref={chatContainerRef}>
          {isFetchingNextPage && (
            <div className="flex flex-col gap-4">
              <Skeleton className="w-20 h-10 rounded-2xl self-end" />
              <Skeleton className="md:w-80 w-30 h-4" />
              <Skeleton className="md:w-100 w-20 h-4" />
              <Skeleton className="md:w-90 w-28 h-4" />
              <Skeleton className="w-50 h-10 rounded-2xl self-end" />
              <Skeleton className="md:w-80 w-40 h-4" />
              <Skeleton className="md:w-60 w-20 h-4" />
              <Skeleton className="md:w-70 w-30 h-4" />
              <Skeleton className="md:w-74 w-34 h-4" />
              <Skeleton className="md:w-120 w-40 h-10 rounded-2xl self-end" />
            </div>
          )}
          
          <ChatMessages messages={messages} thinking={thinking} hasMore={hasMore} isFetchingNextPage={isFetchingNextPage} fetchMessageForConversation={fetchMessageForConversation} />

          <ChatInput handleSend={handleSend} />

          <div className={`fixed inset-x-0 mx-auto z-10 bottom-0 bg-neutral-900 w-full h-20`}></div>
        </div>
      </div>
    </>
  );
}
