"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | null;
};

export default function TaskPage() {
  const router = useRouter();
  const params = useParams<{
    teamId: string;
    projectId: string;
    taskId: string;
  }>();

  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/projects/${params.projectId}/tasks/${params.taskId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setTask(data.data);
        }
      });
  }, [params.teamId, params.projectId, params.taskId, router]);

  if (!task) {
    return <main className="p-8">Loading...</main>;
  }

  return (
    <main className="p-8">
      <button
        onClick={() =>
          router.push(`/teams/${params.teamId}/projects/${params.projectId}`)
        }
        className="mb-6 cursor-pointer"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold">{task.title}</h1>

      {task.description && (
        <p className="mt-4 text-gray-600">{task.description}</p>
      )}

      <div className="mt-6 space-y-2">
        <p>Status: {task.status}</p>
        <p>Priority: {task.priority}</p>

        {task.dueDate && (
          <p>Due date: {new Date(task.dueDate).toLocaleDateString()}</p>
        )}
      </div>
    </main>
  );
}
