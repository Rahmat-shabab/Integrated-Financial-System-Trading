import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";

function isAuthNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const cause = "cause" in error ? error.cause : undefined;
    const text = `${error.name} ${error.message}`;

    return (
      text.includes("fetch failed") ||
      text.includes("ENOTFOUND") ||
      text.includes("EAI_AGAIN") ||
      text.includes("ECONNREFUSED") ||
      text.includes("ETIMEDOUT") ||
      isAuthNetworkError(cause)
    );
  }

  return typeof error === "string" && error.includes("fetch failed");
}

export async function getCurrentUser() {
  let user;

  try {
    user = await stackServerApp.getUser();
  } catch (error) {
    if (isAuthNetworkError(error)) {
      redirect("/auth-unavailable");
    }
    throw error;
  }

  if (!user) {
    redirect("/sign-in");
  }
  return user;
}
