import {PostgresSaver} from "@langchain/langgraph-checkpoint-postgres";

const DB_URI = process.env.DATABASE_URL!;
export const checkpointer = PostgresSaver.fromConnString(DB_URI);