import { redirect } from "next/navigation";
import { Sidebar } from "@/components/scout/sidebar";
import { BottomNav } from "@/components/scout/bottom-nav";
import { getAuthState } from "@/lib/auth/session";

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthState();

  // Belt-and-suspenders: middleware should have already redirected, but if a
  // visitor lands here without a session AND without the guest cookie, bounce.
  if (!auth.authenticated && !auth.guest) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh">
      <Sidebar auth={auth} />
      <main className="relative flex-1 pb-24 lg:pb-0">
        <div className="grid-mask pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]" />
        <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-6">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
