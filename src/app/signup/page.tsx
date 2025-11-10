"use client"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { signUpSchema } from "@/schema/signUpSchema";


export default function SignupPage() {
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    const handleGoogleSignUp = async () => {
        try {
            await authClient.signIn.social({
                provider: "google",
            });
        } catch (error) {
            console.error("Something went wrong: ", error);
        }
    };

    const onSubmit = async (formData: z.infer<typeof signUpSchema>) => {
        setLoading(true);
        const name = formData.name;
        const email = formData.email;
        const password = formData.password;
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
                alert("User has been signed up successfully. A verification email has been sent to your email.");
                redirect("/");
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
        <div className="flex flex-col items-center justify-center h-screen gap-4 px-2">
            <Card className="w-full sm:max-w-md border-blue-900" style={{boxShadow: "0 0 50px 20px #0000ff22"}}>
                <CardHeader>
                    <CardTitle className="mx-auto text-2xl">Sign Up</CardTitle>
                    <CardDescription className="mx-auto font-light">
                        Get access to world&apos;s most intelligent AI.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full flex items-center justify-center mb-10" type="button" variant="outline" onClick={handleGoogleSignUp}>
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="size-5">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                        Sign up with Google
                    </Button>
                    <form id="form-signup" onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Controller
                                name="name"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-signup-name">
                                            Name
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="form-signup-name"
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Batman"
                                            className="font-light"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="form-signup-email">
                                            Email
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="form-signup-email"
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
                                        <FieldLabel htmlFor="form-signup-password">
                                            Password
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="form-signup-password"
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
                        <Button type="submit" form="form-signup" className="w-full bg-blue-500 text-white hover:bg-blue-700">
                            {loading ? "Signing up..." : "Sign up"}
                        </Button>
                    </Field>
                </CardFooter>
            <p className="text-sm font-light w-full text-center">Already a user, <Link href="/signin" className="text-blue-500">Sign In</Link></p>
            </Card>
        </div>
    );
}