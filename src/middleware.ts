import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export function middleware(request: NextRequest) {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
        return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/test'],
};
