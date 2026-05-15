import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

export async function proxy(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  const isProtected = pathname.startsWith("/dashboard")
  const isAuth = pathname.startsWith("/login") || pathname.startsWith("/register")

  if (isProtected && !session?.user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuth && session?.user) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
