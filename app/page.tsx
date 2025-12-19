import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Bottle Opener 🍾</h1>

      <div className="flex gap-4">
        {/* Show this if the user is NOT logged in */}
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>

        {/* Show this if the user IS logged in */}
        <SignedIn>
          <div className="flex flex-col items-center gap-4">
            <p className="text-xl">You are logged in!</p>
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </main>
  );
}
