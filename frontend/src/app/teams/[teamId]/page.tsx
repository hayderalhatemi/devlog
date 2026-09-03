"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Project = {
  id: string;
  name: string;
  description: string | null;
};

export default function TeamPage() {
  const router = useRouter();
  const params = useParams<{ teamId: string }>();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

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
  }, [params.teamId, router]);

  return (
    <main className="p-8">
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-6 cursor-pointer"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold">Projects</h1>

      <div className="mt-6 space-y-3">
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
