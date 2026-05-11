import Link from "next/link";

export default function AuthUnavailablePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">
          Authentication is unavailable
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          The app could not reach Stack Auth. Check your internet connection,
          DNS settings, and Stack Auth environment variables, then try again.
        </p>
        <Link
          href="/sign-in"
          className="mt-6 inline-flex rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
        >
          Try signing in again
        </Link>
      </div>
    </main>
  );
}
