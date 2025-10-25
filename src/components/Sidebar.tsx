"use client"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import {  MoreVerticalIcon, PlusIcon, Settings, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { usePathname, useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useChat } from "@/context/ChatContext";
import { ScrollArea } from "./ui/scroll-area";

interface Chats{
    id: string;
    userId: string;
    title: string;
    model: string;
}

export const HomeSidebar = () => {
    const { state } = useSidebar();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const {setActiveConversationId, setMessages} = useChat();

    const deleteConversation = async (conversationId: string) => {
        try {
            const response = await fetch("/api/conversation", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({conversationId: conversationId})
            })

            if(!response.ok){
                return "Something went wrong"
            }

            const result = await response.json();
            alert("Chat deleted successfully");
            setChats((prev) => prev.filter((chat: Chats) => chat.id !== conversationId));
            router.refresh();
            if(pathname === `/conversation/${conversationId}`){
                router.push("/conversation")
            }
            return result.message;
        } catch (error) {
            console.log(error); 
        }
    }

    const fetchConversations = async () => {
        setLoading(true);
        try {
            // if(!session){
            //     return;
            // }

            const response = await fetch("/api/conversation", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (!response.ok) {
                return "Error"
            }

            const result = await response.json()
            setChats(result.message);
            return result.message;
        } catch (error) {
            console.log("Something went wrong", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchConversations();
    }, [])

    const handleNewChat = () => {
        setActiveConversationId(null);
        setMessages([]);
        router.push("/conversation");
    }

    return (
        <Sidebar className="bg-neutral-800 border-none py-4 px-2 z-50" collapsible="icon" >
            <SidebarTrigger className="mb-4 md:mt-0 mt-4 dark:hover:bg-neutral-900" />
            <SidebarContent className="">
                <SidebarMenu>
                    <SidebarMenuItem>
                            <SidebarMenuButton className="truncate hover:bg-neutral-900" onClick={handleNewChat}>
                                <PlusIcon />
                                New Chat
                            </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                {state === "expanded" ? ( 
                    <ScrollArea className="h-full overflow-y-auto relative">                   
                    <SidebarGroup className="md:w-60 w-72">
                        <SidebarGroupLabel>Chats</SidebarGroupLabel>
                        <SidebarGroupContent >
                            <SidebarMenu >
                                {loading ? (
                                    <div className="flex flex-col gap-2">
                                    <Skeleton className="w-full h-8 bg-neutral-700" />
                                    <Skeleton className="w-full h-8 bg-neutral-700" />
                                    <Skeleton className="w-full h-8 bg-neutral-700" />
                                    <Skeleton className="w-full h-8 bg-neutral-700" />
                                    <Skeleton className="w-full h-8 bg-neutral-700" />
                                    </div>
                                ) : (
                                    chats.length === 0 ? (
                                        <div className="font-extralight">
                                            No chats available
                                        </div>
                                    ) : (
                                        chats.map((chat: Chats, index) => (
                                            <div key={index} className="">
                                                <SidebarMenuItem className={`flex justify-between hover:bg-neutral-900 rounded-md ${pathname === `/conversation/${chat.id}` ? "bg-neutral-900" : ""}`}>
                                                    <Link href={`/conversation/${chat.id}`} className={`font-extralight rounded-md overflow-hidden hover:bg-neutral-900 w-full`}>
                                                        <SidebarMenuButton className={`flex-1 truncate justify-between active:bg-transparent w-full hover:bg-transparent`}>
                                                            <span className="truncate">{chat.title}</span>
                                                        </SidebarMenuButton>
                                                    </Link>
                                                    <DropdownMenu modal={false}>
                                                            <DropdownMenuTrigger
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                }}
                                                                className="p-1 cursor-pointer"
                                                            >
                                                                <MoreVerticalIcon size="14" />
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        e.preventDefault();
                                                                        deleteConversation(chat.id)
                                                                    }} 
                                                                    className="justify-between font-extralight"
                                                                >
                                                                    Delete
                                                                    <Trash2Icon />
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                </SidebarMenuItem>
                                            </div>
                                        ))
                                    )
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    </ScrollArea>
                ): (
                    <div className="h-full"></div>
                )}
                <SidebarMenu className="md:mb-0 mb-4">
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            disabled={true}
                            className="truncate hover:bg-neutral-900 text-sm font-light">
                            <Settings />
                            Settings and help
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    )
}