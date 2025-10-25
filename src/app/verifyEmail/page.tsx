"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useEffect, useState } from "react"

const VerifyEmail = () => {
    const [sending, setSending] = useState(false);
    const COOLDOWN = 60;
    const [timeLeft, setTimeLeft] = useState(0);



    const {data: session} = authClient.useSession();

    const handleVerificationEmailSend = async () => {
        setSending(true);
        try {
            if(!session || !session.user) return;

            const now = Date.now();
            localStorage.setItem("lastEmailSent", now.toString());
            
            await authClient.sendVerificationEmail({
                email: session.user.email,
            });
            
            alert("Verification email has been sent to your email.");
            
            setTimeLeft(60);
        } catch (error) {
            console.log("Something went wrong", error);
        }finally{
            setSending(false);
        }
    }

    useEffect(() => {
        const lastSent = localStorage.getItem("lastEmailSent");

        if(lastSent){
            const diff = Math.floor((Date.now() - parseInt(lastSent, 10)) / 1000);
            if(diff < COOLDOWN){
                setTimeLeft(COOLDOWN - diff);
            }
        }
    }, [])

    useEffect(() => {
        if(timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1)
        }, 1000)

        return () => clearInterval(timer);
    }, [timeLeft])

  return (
    <div>
        <div className="fixed inset-0 flex items-center justify-center">
            <div className="rounded-2xl p-8 bg-neutral-950 md:w-100 max-h-fit flex flex-col gap-2 items-center border border-blue-900 shadow-2xl shadow-black">
                <h1 className="text-2xl text-blue-400 font-bold">Verify your email</h1>
                <p className="font-extralight text-muted-foreground text-sm">We&apos;ll send you a verification link to your email.</p>
                <Button
                    onClick={handleVerificationEmailSend}
                    variant="outline" 
                    className="mt-10"
                    disabled={timeLeft > 0}
                >
                    {sending ? "Sending..." : "Send email"}
                </Button>
                {timeLeft > 0 && (
                    <div>
                        <p className="font-extralight text-sm">Resend in <span className="font-medium text-blue-500">{timeLeft}s</span></p>
                    </div>
                )}
            </div>
        </div>
    </div>
  )
}

export default VerifyEmail