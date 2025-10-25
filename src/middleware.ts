export const runtime = "nodejs";

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './lib/auth';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    const isPublicPath =
        path === "/" ||
        path === "/signin" ||
        path === "/signup" ||
        path === "/verifyEmail"

    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (isPublicPath && session && session.user.emailVerified) {
        return NextResponse.redirect(new URL('/conversation', request.url))
    }

    if(!isPublicPath && !session){
        return NextResponse.redirect(new URL('/signin', request.url))
    }
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        '/',
        '/signin',
        '/signup',
        '/verifyEmail',
        '/conversation(.*)'
    ],
}