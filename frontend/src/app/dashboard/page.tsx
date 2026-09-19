"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Team = {
  id: string;
  name: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teams`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setTeams(data.data);
        }
      });
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    router.replace("/login");
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome to DevLog.</p>

      <button
        onClick={handleLogout}
        className="mt-4 cursor-pointer rounded-md border px-4 py-2"
      >
        Logout
      </button>

      <h2 className="mt-8 text-xl font-semibold">Your teams</h2>

      <button
        onClick={() => router.push("/teams/new")}
        className="mt-4 cursor-pointer rounded-md bg-black px-4 py-2 text-white"
      >
        New Team
      </button>

      <div className="mt-4 space-y-3">
        {teams.map((team) => (
          <div
            key={team.id}
            onClick={() => router.push(`/teams/${team.id}`)}
            className="cursor-pointer rounded-md border p-4 hover:bg-gray-50"
          >
            {team.name}
          </div>
        ))}
      </div>
    </main>
  );
}
