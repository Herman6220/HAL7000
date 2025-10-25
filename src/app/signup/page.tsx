"use client"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";


export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    // const [image, setImage] = useState("");
    const [loading, setLoading] = useState(false);


    const handleSignup = async (e: React.FocusEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const { data, error } = await authClient.signUp.email({
            email, // user email address
            password, // user password -> min 8 characters by default
            name, // user display name
            // image, // User image URL (optional)
            callbackURL: "/dashboard" // A URL to redirect to after the user verifies their email (optional)
        }, {
            onRequest: () => {
                console.log("Signing up...")
            },
            onSuccess: () => {
                redirect("/")
            },
            onError: (ctx) => {
                // display the error message
                alert(ctx.error.message);
            },
        });
        console.log(data);
        console.log(error);
        setLoading(false);
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-2xl font-bold">
                Sign Up
            </h1>
            <form onSubmit={handleSignup} className="flex flex-col gap-3 w-64">
                <Input type="text" name="name" placeholder="Name" onChange={(e) => setName(e.target.value)} required />
                <Input type="text" name="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
                <Input type="password" name="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
                <Button type="submit">
                    {loading ? ("Signing up...") : ("Sign Up")}
                </Button>
            </form>
            <p className="text-sm font-extralight">Already a user, <Link href="/signin" className="text-blue-500">Sign In</Link></p>
        </div>
    );
}