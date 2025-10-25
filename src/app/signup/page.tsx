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