import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const localePattern = `/:locale(${routing.locales.join("|")})`;
const isProtectedRoute = createRouteMatcher([`${localePattern}/upload(.*)`]);

const intlMiddleware = createMiddleware(routing);

export default clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname.startsWith('/api/mux')) {
    return;
  }

  const intlResponse = intlMiddleware(req);

  if (isProtectedRoute(req)) await auth.protect();

  return intlResponse;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
