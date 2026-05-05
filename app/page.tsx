import { redirect } from "next/navigation";

// Redirect root to dashboard (avoids route conflict with app/(app)/page.tsx)
export default function Root() {
  redirect("/dashboard");
}
