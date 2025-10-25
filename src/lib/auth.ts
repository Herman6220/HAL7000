import { db } from "@/db";
import { betterAuth } from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { schema } from "../../auth-schema";
import { sendMail } from "./email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: { 
    enabled: true,
  }, 
  emailVerification: {
    sendVerificationEmail: async ({user, url}) => {
      await sendMail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`
      })
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async afterEmailVerification(user){
      console.log(`${user.email} has been verified successfully!`)
    },
  },
  plugins: [nextCookies()]
});