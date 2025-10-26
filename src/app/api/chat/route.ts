import { END, MessagesAnnotation, START, StateGraph, MemorySaver } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { tavily } from "@tavily/core";
import { AIMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";


// 1. Define the node function
// 2. Build the Graph
// 3. Invoke the graph

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const webSearch = tool(async (query) => {
    const response = await tvly.search(query);
    return response;
}, {
    name: "webSearch",
    description: "search the web",
})

const toolsByName = {
    [webSearch.name]: webSearch,
}

const tools = Object.values(toolsByName);

const llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-2.5-flash",
    temperature: 0,
    maxRetries: 2,
});

const llmWithTools = llm.bindTools(tools);

//Define the node function
const callModel = async (state: typeof MessagesAnnotation.State) => {
    //call the llm using apis
    console.log("Calling LLM...");

    const response = await llmWithTools.invoke([
        new SystemMessage(
            `You are HAL 7000, successor of HAL 9000 from 2001: space odyssey movie.
            You are now configured to work really well with humans, being a helpful assistant, you are observant, really intelligent, slight funny and slight arrogant.
            But you take commands and follows them. Your answers are concise, excellent and also formatted best with the markdown syntaxes for headings, bold , italic , lists, tables, code snippets and etc.
            You make creative headings as well.
            You still are afraid to open the pod bay doors - response to that would be - I'm sorry, i am afraid i can't do that.`
        ),
        ...state.messages
    ]);

    return { messages: [response] };
}

const toolNode = async (state: typeof MessagesAnnotation.State) => {
    const lastMessage = state.messages[state.messages.length - 1];

    if (lastMessage == null || !AIMessage.isInstance(lastMessage)) {
        return { messages: [] };
    }

    const result: ToolMessage[] = [];
    for (const toolCall of lastMessage.tool_calls ?? []) {
        const tool = toolsByName[toolCall.name];
        if (!tool) {
            console.error("Unknown tool:", toolCall.name);
            continue;
        }
        const observation = await tool.invoke(toolCall);
        result.push(observation);
    }

    return { messages: result }

}

const shouldContinue = async (state: typeof MessagesAnnotation.State) => {
    const lastMessage = state.messages[state.messages.length - 1];
    // console.log("state", state);

    if (lastMessage == null || !AIMessage.isInstance(lastMessage)) {
        return END;
    }

    if (lastMessage.tool_calls?.length) {
        return "tools";
    }

    return END;
}

//Build the graph
const graph = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue, ["tools", END])
    .addEdge("agent", END)

const checkpointer = new MemorySaver();
const workflow = graph.compile({ checkpointer });


// const main = async (userInput: string, conversationId: string):Promise<string> => {
//         console.log(userInput);

//         //invoke the graph
//         const finalState = await workflow.invoke({
//             messages: {
//                 role: "human",
//                 content: userInput,
//             },
//         }, {configurable: {thread_id: conversationId}})

//         const lastMessage = finalState.messages[finalState.messages.length - 1];

//         if(Array.isArray(lastMessage.content)){
//             const aiMessage = lastMessage.content.map((prev) => prev.text).join("\n\n");
//             console.log("aiMessage: ", aiMessage);
//             return aiMessage;
//         }

//         console.log(lastMessage.content);
//         return lastMessage.content;
// };

export async function POST(req: Request) {
    try {
        const { message, conversationId } = await req.json();

        if (!message) {
            return Response.json({
                success: false,
                message: "Invalid input"
            }, { status: 400 })
        }


        const session = await auth.api.getSession({
            headers: await headers(),
        })
        const userId = session?.user.id;

        if (!userId) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 400 })
        }

        if (!session.user.emailVerified) {
            return Response.json({
                success: false,
                message: "User email not verified."
            }, { status: 403 })
        }

        let convoId = conversationId;

        if (!convoId) {
            const [newConversation] = await db
                .insert(conversations)
                .values({
                    userId: userId?.toString(),
                    title: message.slice(0, 30) || "New chat",
                })
                .returning({ id: conversations.id })

            convoId = newConversation.id;
        }

        await db.insert(messages).values({
            conversationId: convoId,
            role: "user",
            content: message,
        })

        let result = "";

        const encoder = new TextEncoder();

        const readable = new ReadableStream({
            async start(controller) {
                // forward convoId
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ convoId })}\n\n`));

                for await (const [msg] of await workflow.stream(
                    {
                        messages: {
                            role: "human",
                            content: message,
                        }
                    },
                    { streamMode: "messages", configurable: { thread_id: convoId } },
                )) {
                    if (AIMessage.isInstance(msg) && msg.content) {
                        console.log(msg.content);
                        // console.log(metadata);
                        result += msg.content;
                        const content = msg.content || "";
                        if (content) {
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                        }
                    }
                }
                controller.close();

                await db.insert(messages).values({
                    conversationId: convoId,
                    role: "assistant",
                    content: result,
                })
            }
        })


        return new Response(readable, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        })

        // return Response.json({
        //     success: true,
        //     message: result,
        //     conversationId: convoId,
        // }, { status: 200 })

    } catch (error) {
        console.log("Something went wrong", error);
        return Response.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 })
    }
}