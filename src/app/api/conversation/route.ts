import { db } from "@/db";
import { conversations } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";


export async function POST(req: Request){
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) {
            return Response.json({
                success: false,
                message: "Unauthenticated"
            }, { status: 400 })
        }

        const userId = session.user.id;

        const {message} = await req.json();
    
        const [newConversation] = await db
            .insert(conversations)
            .values({
                userId: userId,
                title: message || "New Chat",
            })
            .returning({id: conversations.id});

        return Response.json({
            success: true,
            message: newConversation.id,
        }, {status: 200})
    } catch (error) {
        console.error("An unexpected error occured", error);
        return Response.json({
            success: false,
            message: "Internal server error"
        }, { status: 400 })
    }
}

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) {
            return Response.json({
                success: false,
                message: "Unauthenticated"
            }, { status: 400 })
        }

        const userId = session.user.id;

        const chats = await db
            .select()
            .from(conversations)
            .where(eq(conversations.userId, userId))
            .orderBy(desc(conversations.updatedAt))

        if (!chats || chats.length === 0) {
            return Response.json({
                success: false,
                message: "No conversations found"
            }, { status: 400 })
        }

        return Response.json({
            success: true,
            message: chats,
        }, { status: 200 })
    } catch (error) {
        console.log("An unexpected error occured", error);
        return Response.json({
            success: false,
            message: "Internal server error"
        }, { status: 400 })
    }
}

export async function DELETE(req: Request){
    try {
        const {conversationId} = await req.json();

        if(!conversationId){
            return Response.json({
                success: false,
                message: "Invalid input"
            }, {status: 400})
        }

        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) {
            return Response.json({
                success: false,
                message: "Unauthenticated"
            }, { status: 400 })
        }

        const userId = session.user.id;

        const [removedConversation] = await db
            .delete(conversations)
            .where(and(
                eq(conversations.userId, userId),
                eq(conversations.id, conversationId),
            ))
            .returning();

        if(!removedConversation){
            return Response.json({
                success: false,
                message: "Conversation not found"
            }, {status: 400})
        }

        return Response.json({
            success: true,
            message: removedConversation,
        }, {status: 200})
        
    } catch (error) {
        console.log("An unexpected error occured", error);
        return Response.json({
            success: false,
            message: "Internal server error"
        }, { status: 400 })
    }
}