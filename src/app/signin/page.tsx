"use client"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { signInSchema } from "@/schema/signInSchema";
import { CopyCheck, CopyIcon } from "lucide-react";

export default function SignupPage() {

    const [loading, setLoading] = useState(false);
    const emailRef = useRef<HTMLParagraphElement | null>(null);
    const passwordRef = useRef<HTMLParagraphElement | null>(null);
    const [emailCopied, setEmailCopied] = useState(false);
    const [passwordCopied, setPasswordCopied] = useState(false);

    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (formData: z.infer<typeof signInSchema>) => {
        setLoading(true);
        const email = formData.email;
        const password = formData.password;
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
                if (error.error.status === 403) {
                    alert("Please verify your email address.")
                }
            }
        })
        console.log(data);
        console.log(error);
        setLoading(false);
    }

    const handleEmailCopy = () => {
        if (!emailRef.current) return;
        navigator.clipboard.writeText(emailRef.current.textContent);
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
    }

    const handlePasswordCopy = () => {
        if (!passwordRef.current) return;
        navigator.clipboard.writeText(passwordRef.current.textContent);
        setPasswordCopied(true);
        setTimeout(() => setPasswordCopied(false), 2000);
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4 px-2">
            <div className="flex flex-col items-start justify-center gap-1">
                <div className="flex items-center justify-center gap-1">
                    <p className="text-muted-foreground text-xs font-light">Test email: </p>
                    <p className="text-xs font-light" ref={emailRef}>batman@gmail.com</p>
                    <button onClick={handleEmailCopy} disabled={emailCopied}>
                        {emailCopied ? <CopyCheck size="14"/> : <CopyIcon size="14" />}
                    </button>
                </div>
                <div className="flex items-center justify-center gap-1">
                    <p className="text-muted-foreground text-xs font-light">Test password: </p>
                    <p className="text-xs font-light" ref={passwordRef}>imbatman</p>
                    <button onClick={handlePasswordCopy} disabled={passwordCopied}>
                        {passwordCopied ? <CopyCheck size="14" /> : <CopyIcon size="14" />}
                    </button>
                </div>
            </div>
            <Card className="w-full sm:max-w-md border-blue-900" style={{ boxShadow: "0 0 50px 20px #0000ff22" }}>
                <CardHeader>
                    <CardTitle className="mx-auto text-2xl">Sign In</CardTitle>
                    <CardDescription className="mx-auto font-light">
                        HAL 7000 welcomes again...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form id="form-signin" onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-signin-email">
                                            Email
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="form-signin-email"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="batman@gmail.com"
                                            className="font-light"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-signin-password">
                                            Password
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="form-signin-password"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="*********"
                                            autoComplete="off"
                                            type="password"
                                            className="font-light"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </form>
                </CardContent>
                <CardFooter>
                    <Field orientation="horizontal">
                        <Button type="submit" form="form-signin" className="w-full bg-blue-500 text-white hover:bg-blue-700">
                            {loading ? "Signing in..." : "Sign in"}
                        </Button>
                    </Field>
                </CardFooter>
                <p className="text-sm font-light w-full text-center">New user, <Link href="/signup" className="text-blue-500">Sign Up</Link></p>
            </Card>
        </div>
    );
}