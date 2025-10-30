"use client"

import { useSidebar } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { ArrowUp, Loader2, PlusIcon} from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@/context/ChatContext";
import { ChatMessage } from "@/components/ChatMessages";


export default function Home() {

  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const { state } = useSidebar();
  const { data: session } = authClient.useSession();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { activeConversationId, setActiveConversationId, messages, setMessages } = useChat();

  useEffect(() => {
    const parts = window.location.pathname.split("/");
    const id = parts[parts.length - 1];
    if (id && id !== "conversation") {
      setActiveConversationId(id);
    }
  }, [setActiveConversationId]);



  const handleSend = async () => {
    if (!session) {
      redirect("/signin");
    }

    if (!session.user.emailVerified) {
      redirect("/verifyEmail");
    }

    if (!text.trim()) {
      return;
    }

    setIsSending(true);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ]);

    const currenInput = text;
    setText("");

    if (!activeConversationId || activeConversationId === null) {
      const chatId = await getChatId(currenInput);
      window.history.pushState(null, "", `/conversation/${chatId}`);
      setActiveConversationId(chatId);
      await callServer(currenInput, chatId);
      setIsSending(false);
      return;
    }

    await callServer(currenInput, activeConversationId);
    setIsSending(false);
  }

  const getChatId = async (userInput: string) => {
    try {
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: userInput })
      })

      const result = await response.json();
      return result.message;
    } catch (error) {
      console.log("Something went wrong", error);
    }
  }

  const callServer = async (userInput: string, conversationId: string) => {
    setThinking(true);

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

  useEffect(() => {
    if (isSending) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isSending])

  return (
    <>
      <div className="w-full h-[90vh] overflow-y-auto" ref={chatContainerRef} style={{ scrollbarGutter: "stable", scrollbarWidth: "thin", scrollbarColor: "#aaa #171717" }}>
        <div className="max-w-3xl w-full mx-auto text-white pt-4 pb-50 md:text-base text-sm flex flex-col gap-4 relative md:px-0 px-2" >
          {(messages.length === 0 && session) && (
            <div className="w-full flex items-center justify-center mt-16">
              <div className="max-w-fit flex flex-col items-center justify-center gap-2 px-4">
                <h1 className="font-extralight italic text-lg md:text-2xl text-blue-500 text-center">&quot;Just what do you think you&apos;re doing, <span className="font-medium">{session?.user.name}</span>?&quot;</h1>
                <p className="font-extralight text-xs text-muted-foreground md:text-sm md:self-end">(HAL 9000 - My predecessor)</p>
              </div>
            </div>
          )}
          {messages.length === 0 && !session && (
            <div className="w-full items-center justify-center mt-16">
              <h1 className="md:text-3xl text-lg text-center font-light">What are you up to?</h1>
            </div>
          )}
          {Array.isArray(messages) && messages.map((msg, index) => (
            <ChatMessage key={index} msg={msg}/>
          ))}

          {thinking && (
            <div className="animate-pulse font-extralight">
              Thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className={`fixed inset-x-0 bottom-0 flex justify-center items-end ${messages.length === 0 ? "md:pb-[40vh]" : "md:pb-0"} transition-all duration-300 ease-in-out z-20 ${state === "expanded" ? "md:left-61.5" : "md:left-9.5"}`}>
        <div className={`pb-4 p-2 md:pb-2 md:mb-10 max-w-3xl bottom-0 w-full min-h-30 max-h-100 bg-neutral-900 ${messages.length === 0 ? "shadow-2xl" : "shadow-md"} shadow-black md:rounded-3xl md:border border-t border-neutral-700 flex flex-col items-center justify-between gap-4 overflow-y-auto transition-all duration-300`}>
          <textarea
            className="resize-none w-full focus:outline-none text-white p-3 font-light"
            rows={1}
            placeholder="Ask something..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = target.scrollHeight + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          ></textarea>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <button className="rounded-full hover:bg-neutral-800 p-2" disabled={true}>
                <PlusIcon size="20" />
              </button>
            </div>
            <div className="flex items-center gap-2">

              <button
                className="rounded-full hover:bg-blue-700 bg-blue-500 shadow-md shadow-black p-2 disabled:opacity-50 cursor-pointer"
                onClick={handleSend}
                disabled={!text || isSending}
              >
                {isSending ? <Loader2 size="20" className="animate-spin"/> : <ArrowUp size="20" />}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={`fixed ${state === "expanded" ? "md:left-61.5" : "md:left-9.5"} max-w-3xl inset-x-0 mx-auto z-10 bottom-0 bg-neutral-900 w-full h-20 transition-all duration-300`}></div>
    </>
  );
}
