import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export function proxy(request: NextRequest) {
  const { supabaseResponse } = createClient(request);
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images.
     * This ensures Supabase auth cookies are refreshed on every navigation.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
