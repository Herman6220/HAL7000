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
  session: {
    expiresIn: 60 * 60 * 24 * 7, 
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    }
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }
  },
  emailAndPassword: { 
    enabled: true,
    autoSignIn: true,
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