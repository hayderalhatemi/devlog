"use client";

import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  function handleLogout() {
    localStorage.removeItem("token");
    router.replace("/login");
  }

  return (
    <header className="flex items-center justify-between border-b px-8 py-4">
      <button
        onClick={() => router.push("/dashboard")}
        className="cursor-pointer text-xl font-bold"
      >
        DevLog
      </button>

      <button
        onClick={handleLogout}
        className="cursor-pointer rounded-md border px-4 py-2"
      >
        Logout
      </button>
    </header>
  );
}
