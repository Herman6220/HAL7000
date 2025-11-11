"use client"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { signInSchema } from "@/schema/signInSchema";

export default function SignupPage() {

    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const handleGoogleSignIn = async () => {
        try {
            await authClient.signIn.social({
                provider: "google",
            });
        } catch (error) {
            console.error("Something went wrong: ", error);
        }
    };

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
            rememberMe: true
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

    const handleTestCredentials = () =>{
        if(form.getValues("email") || form.getValues("password")){
            return;
        }
        form.setValue("email", "batman@gmail.com");
        form.setValue("password", "imbatman");
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4 px-2">
            <div className="flex flex-col items-start justify-center gap-1">
            </div>
            <Card className="w-full sm:max-w-md border-blue-900" style={{ boxShadow: "0 0 50px 20px #0000ff22" }}>
                <CardHeader>
                    <CardTitle className="mx-auto text-2xl">Sign In</CardTitle>
                    <CardDescription className="mx-auto font-light">
                        HAL 7000 welcomes again...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-10 flex flex-col gap-2">
                    <Button className="w-full flex items-center justify-center" type="button" variant="outline" onClick={handleGoogleSignIn}>
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="size-5">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                        Sign in with Google
                    </Button>
                    <Button variant="outline" className="text-blue-400 hover:text-blue-500" onClick={handleTestCredentials}>
                        Use test credentials
                    </Button>
                    </div>
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