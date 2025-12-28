import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Use routing configuration to build locale-aware protected routes
const localePattern = `/:locale(${routing.locales.join("|")})`;
const isProtectedRoute = createRouteMatcher([`${localePattern}/upload(.*)`]);

const intlMiddleware = createMiddleware(routing);

export default clerkMiddleware(async (auth, req) => {
  // Skip intl middleware for Mux API routes
  // Authentication is handled by our API routes
  if (req.nextUrl.pathname.startsWith('/api/mux')) {
    return;
  }
  
  // Run the intl middleware first
  const intlResponse = intlMiddleware(req);
  
  // Then apply Clerk protection if needed
  if (isProtectedRoute(req)) await auth.protect();
  
  // Return the intl response if it exists, otherwise continue
  return intlResponse;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
