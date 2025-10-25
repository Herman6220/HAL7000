import { ArrowUp, PlusIcon } from "lucide-react";
import { useSidebar } from "./ui/sidebar";
import { useState } from "react";


interface ChatInputProps{
    handleSend: (text: string) => void;
}


export const ChatInput = ({
    handleSend
}: ChatInputProps) => {
    const { state } = useSidebar();
    const [text, setText] = useState("");

    const onSend = () => {
        if(!text.trim()) return;
        handleSend(text);
        setText("");
    }

    return (
        <>
            <div className={`fixed ${state === "expanded" ? "md:left-64" : "md:left-12"} inset-x-0 z-20 mx-auto pb-4 p-2 md:pb-2 md:mb-10 max-w-3xl bottom-0 w-full min-h-30 max-h-100 bg-neutral-900 shadow-md shadow-black md:rounded-3xl md:border border-t border-neutral-700 flex flex-col items-center justify-between gap-4 overflow-y-auto transition-all duration-300`}>
                <textarea
                    className="resize-none w-full focus:outline-none text-white p-3 font-workSans font-light"
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
                            onSend();
                        }
                    }}
                ></textarea>
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <button className="rounded-full hover:bg-neutral-800 p-2" disabled={true}>
                            <PlusIcon size="20" />
                        </button>
                        {/* <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setAudioFile(e.target.files[0]);
                    }
                  }}
                  className="rounded-full p-2 hover:bg-neutral-800 max-w-fit cursor-pointer"
                /> */}
                    </div>
                    <div className="flex items-center gap-2">
                        {/* <button
                            className="rounded-full hover:bg-neutral-800 p-2"
                            onClick={handleAudioSend}
                            disabled={true}
                        >
                            <Mic size="20" />
                        </button> */}

                        <button
                            className="rounded-full hover:bg-blue-800 bg-blue-700 shadow-md shadow-black p-2 disabled:opacity-50 cursor-pointer"
                            onClick={onSend}
                            disabled={!text}
                        >
                            <ArrowUp size="20" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}