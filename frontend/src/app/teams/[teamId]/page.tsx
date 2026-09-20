"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Project = {
  id: string;
  name: string;
  description: string | null;
};

type Member = {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type JwtPayload = {
  userId: string;
};

export default function TeamPage() {
  const router = useRouter();
  const params = useParams<{ teamId: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentRole, setCurrentRole] = useState<Member["role"] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const payload = JSON.parse(atob(token.split(".")[1])) as JwtPayload;

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/projects`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setProjects(data.data);
        }
      });

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/members`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const currentMember = data.data.find(
            (member: Member) => member.user.id === payload.userId,
          );

          setCurrentRole(currentMember?.role ?? null);
          setLoading(false);
        }
      });
  }, [params.teamId, router]);

  const isOwner = currentRole === "OWNER";

  async function handleLeaveTeam() {
    const confirmed = window.confirm(
      "Are you sure you want to leave this team?",
    );

    if (!confirmed) {
      return;
    }

    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/leave`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    if (data.success) {
      router.push("/dashboard");
    } else {
      setError(data.message || "Failed to leave team");
    }
  }

  if (loading) {
    return <p className="p-8">Loading...</p>;
  }

  return (
    <main className="p-8">
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-6 cursor-pointer"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold">Projects</h1>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => router.push(`/teams/${params.teamId}/projects/new`)}
          className="cursor-pointer rounded-md bg-black px-4 py-2 text-white"
        >
          New Project
        </button>

        {isOwner && (
          <button
            onClick={() => router.push(`/teams/${params.teamId}/edit`)}
            className="cursor-pointer rounded-md border px-4 py-2"
          >
            Edit Team
          </button>
        )}

        <button
          onClick={() => router.push(`/teams/${params.teamId}/members`)}
          className="cursor-pointer rounded-md border px-4 py-2"
        >
          Members
        </button>

        {currentRole && !isOwner && (
          <button
            onClick={handleLeaveTeam}
            className="cursor-pointer rounded-md border px-4 py-2"
          >
            Leave Team
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-red-600">{error}</p>}

      <div className="mt-6 space-y-3">
        {projects.length === 0 && (
          <p className="text-gray-600">No projects yet.</p>
        )}

        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() =>
              router.push(`/teams/${params.teamId}/projects/${project.id}`)
            }
            className="cursor-pointer rounded-md border p-4 hover:bg-gray-50"
          >
            <h2 className="font-semibold">{project.name}</h2>

            {project.description && (
              <p className="mt-1 text-gray-600">{project.description}</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
