
import { Check, CopyCheckIcon, CopyIcon, StopCircleIcon, Volume2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { InfiniteScroll } from "./infinite-scroll";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CodeProps {
  //   node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface ChatMessagesProps {
  messages: Message[];
  thinking: boolean;
  hasMore: boolean;
  isFetchingNextPage: boolean;
  fetchMessageForConversation: () => void;
  isSending: boolean;
}

// 👇 move this outside the ChatMessage component
const CodeBlock: React.FC<CodeProps> = ({ inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || "");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    const language = match[1];

    return (
      <div className="relative rounded-2xl overflow-hidden my-2">
        <div className="absolute top-3 left-4 font-sans text-xs text-white">{language}</div>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-2 text-xs text-white font-sans cursor-pointer px-2 rounded"
        >
          {copied ? (
            <div className="flex gap-1">
              <CopyCheckIcon size="14" /> Copied
            </div>
          ) : (
            <div className="flex gap-1">
              <CopyIcon size="14" /> Copy code
            </div>
          )}
        </button>
        <SyntaxHighlighter
          style={{
            ...vscDarkPlus,
            'code[class*="language-"]': {
              ...vscDarkPlus['code[class*="language-"]'],
              fontSize: "0.9rem",
            },
          }}
          language={language}
          PreTag="div"
          {...props}
          customStyle={{
            paddingTop: "3rem",
            margin: "0px",
          }}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code
      className="font-extralight bg-neutral-800 border border-neutral-700 mx-0.5 px-2 py-0.5 rounded text-gray-300"
      {...props}
    >
      {children}
    </code>
  );
};



const ChatMessage = ({ msg }: { msg: Message }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMessageCopied, setIsMessageCopied] = useState(false);
  const messageRef = useRef<HTMLDivElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const textToSpeech = async (text: string) => {
    const speechSynth = window.speechSynthesis;

    const trimmed = text.trim();
    if (!trimmed) return;

    if (isSpeaking) {
      speechSynth.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    const voices = window.speechSynthesis.getVoices();
    const utterance = new SpeechSynthesisUtterance(trimmed);
    utteranceRef.current = utterance;
    utterance.rate = 1.0;
    utterance.pitch = 0.7;
    utterance.volume = 1.0;
    utterance.voice = voices[8];

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynth.speak(utterance);
  }

  const handleMessageCopy = () => {
     if(!messageRef.current) return;
     navigator.clipboard.writeText(messageRef.current.textContent);
     setIsMessageCopied(true);
     setTimeout(() => setIsMessageCopied(false), 2000);
  }

  return (
    <>
      <div
        className={`font-light overflow-x-auto text-gray-200 ${msg.role === "user"
          ? "self-end max-w-[70%]"
          : "self-start max-w-[100%] leading-8"
          }`}
        style={{ scrollbarColor: "#888 #171717", scrollbarWidth: "thin" }}
        ref={messageRef}
      >
        {msg.role === "assistant" ? (
          <>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ ...props }) => <h1 className="text-3xl font-bold my-4" {...props} />,
                h2: ({ ...props }) => <h1 className="text-2xl font-bold my-3" {...props} />,
                h3: ({ ...props }) => <h1 className="text-xl font-bold my-2" {...props} />,
                code: CodeBlock,
              }}
            >
              {msg.content}
            </ReactMarkdown>
            <div className="flex items-center gap-1">
              <button
                onClick={handleMessageCopy}
                className="text-gray-400 hover:bg-gray-500/50 rounded-full flex items-center justify-center p-1"
              >
                {isMessageCopied ? <Check size={18}/> : <CopyIcon size={18}/>}
              </button>
              <button
                onClick={() => textToSpeech(msg.content)}
                className="text-gray-400 hover:bg-gray-500/50 rounded-full flex items-center justify-center p-1"
              >
                {isSpeaking ? <StopCircleIcon size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          </>
        ) : (
          <>
          <div className="bg-[#222] px-4 py-2 rounded-2xl my-0.5">
          <ReactMarkdown>
            {msg.content}
          </ReactMarkdown>
          </div>
          <div className="flex items-center justify-end gap-1">
            <button
                onClick={handleMessageCopy}
                className="text-gray-400 hover:bg-gray-500/50 rounded-full flex items-center justify-center p-1"
              >
                {isMessageCopied ? <Check size={18}/> : <CopyIcon size={18} className="-scale-x-100"/>}
              </button>
          </div>
          </>
        )}
      </div>
    </>
  )
}


const ChatMessagesComponent: React.FC<ChatMessagesProps> = ({
  messages,
  thinking,
  hasMore,
  isFetchingNextPage,
  fetchMessageForConversation,
  isSending,
}: ChatMessagesProps) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isSending) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isSending])

  return (
    <>
      <InfiniteScroll
        hasNextPage={hasMore}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchMessageForConversation}
      />
      {messages.length > 0 && messages.map((msg, index) => (
        <ChatMessage key={index} msg={msg} />
      ))}
      {thinking && <div className="animate-pulse font-extralight">Thinking...</div>}
      <div ref={bottomRef} />
    </>
  )
}


export const ChatMessages = React.memo(ChatMessagesComponent);


