"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Task = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | null;
};

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams<{ teamId: string; projectId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/projects/${params.projectId}/tasks`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setTasks(data.data);
        }
      });
  }, [params.projectId, params.teamId, router]);

  return (
    <main className="p-8">
      <button
        onClick={() => router.push(`/teams/${params.teamId}`)}
        className="mb-6 cursor-pointer"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold">Tasks</h1>

      <div className="mt-6 space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="rounded-md border p-4">
            <h2 className="font-semibold">{task.title}</h2>

            <div className="mt-2 flex gap-4 text-sm text-gray-600">
              <span>{task.status}</span>
              <span>{task.priority}</span>

              {task.dueDate && (
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
