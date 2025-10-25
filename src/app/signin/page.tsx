"use client"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function SignupPage() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false);

    const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const { data, error } = await authClient.signIn.email({
            /**
             * The user email
             */
            email,
            /**
             * The user password
             */
            password,
            /**
             * A URL to redirect to after the user verifies their email (optional)
             */
            callbackURL: "/conversation",
            /**
             * remember the user session after the browser is closed. 
             * @default true
             */
            rememberMe: false
        }, {
            //callbacks
            onError: async (error) => {
                if(error.error.status === 403){
                    alert("Please verify your email address.")
                }
            }
        })
        console.log(data);
        console.log(error);
        setLoading(false);
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-2xl font-bold">
                Sign In
            </h1>
            <form onSubmit={handleSignin} className="flex flex-col gap-3 w-64">
                <Input type="text" name="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
                <Input type="password" name="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
                <Button type="submit">
                    {loading ? "Signing In...": "Sign In"}
                </Button>
            </form>
            <p className="text-sm font-extralight">New user, <Link href="/signup" className="text-blue-500">Sign Up</Link></p>
        </div>
    );
}