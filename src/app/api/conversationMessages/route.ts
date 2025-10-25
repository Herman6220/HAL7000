import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, desc, eq, lt } from "drizzle-orm";
import { headers } from "next/headers";
import { validate } from "uuid";


export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session) {
            return Response.json({
                success: false,
                message: "Unauthenticated"
            }, { status: 401 })
        }

        const userId = session.user.id;

        const url = new URL(req.url);
        const convoId = url.searchParams.get("conversationId");
        const before = url.searchParams.get("before");
        const limit = Number(url.searchParams.get("limit")) || 10;

        console.log(convoId);

        if (!convoId || !validate(convoId)) {
            return Response.json({
                success: false,
                message: "Invalid conversation Id",
            }, { status: 401 })
        }

        const [conversation] = await db
            .select({
                id: conversations.id,
            })
            .from(conversations)
            .where(and(
                eq(conversations.userId, userId.toString()),
                eq(conversations.id, convoId.toString())
            ))

        if (!conversation) {
            return Response.json({
                success: false,
                message: "Unauthenticated",
            }, { status: 401 })
        }

        const conversationId = conversation.id;


        // const data = await db
        //     .select()
        //     .from(messages)
        //     .where(
        //         and(
        //             eq(messages.conversationId, conversationId),
        //             before ? lt(messages.createdAt, new Date(before)) : undefined,
        //         )
        //     )
        //     .orderBy(desc(messages.createdAt))
        //     .limit(4)

        let query = db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(desc(messages.createdAt))
            .limit(limit);

        if (before) {
            query = db
                .select()
                .from(messages)
                .where(
                    and(
                        eq(messages.conversationId, conversationId),
                        lt(messages.createdAt, new Date(before))
                    )
                )
                .orderBy(desc(messages.createdAt))
                .limit(limit);
        }

        const data = await query;


        if (!data || data.length === 0) {
            return Response.json({
                success: false,
                message: "No messages found"
            }, { status: 404 })
        }

        return Response.json({
            success: true,
            message: data,
        }, { status: 200 })

    } catch (error) {
        console.log("An unexpected error occured: ", error)
        return Response.json({
            success: false,
            message: "Internal server error",
        }, { status: 500 })
    }
}