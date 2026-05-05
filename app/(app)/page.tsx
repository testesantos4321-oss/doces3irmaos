import { redirect } from "next/navigation";

// Stub — dashboard lives at /dashboard to avoid root-level route conflict
export default function AppRoot() {
  redirect("/dashboard");
}
