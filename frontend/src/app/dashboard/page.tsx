"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Team = {
  id: string;
  name: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teams`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setTeams(data.data);
        } else {
          setError(data.message || "Failed to load teams");
        }

        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load teams");
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return <p className="p-8">Loading...</p>;
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome to DevLog.</p>

      <h2 className="mt-8 text-xl font-semibold">Your teams</h2>

      <button
        onClick={() => router.push("/teams/new")}
        className="mt-4 cursor-pointer rounded-md bg-black px-4 py-2 text-white"
      >
        New Team
      </button>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      <div className="mt-4 space-y-3">
        {!error && teams.length === 0 && (
          <p className="text-gray-600">No teams yet.</p>
        )}

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
