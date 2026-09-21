"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | null;
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export default function TaskPage() {
  const router = useRouter();
  const params = useParams<{
    teamId: string;
    projectId: string;
    taskId: string;
  }>();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    apiFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/projects/${params.projectId}/tasks/${params.taskId}`,
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setTask(data.data);
        } else {
          setError(data.message || "Failed to load task");
        }
      })
      .catch(() => {
        setError("Failed to load task");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.teamId, params.projectId, params.taskId, router]);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
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

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/projects/${params.projectId}/tasks/${params.taskId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (data.success) {
        router.push(`/teams/${params.teamId}/projects/${params.projectId}`);
      } else {
        setError(data.message || "Failed to delete task");
      }
    } catch {
      setError("Failed to delete task");
    }
  }

  if (loading) {
    return <main className="p-8">Loading...</main>;
  }

  if (!task) {
    return (
      <main className="p-8">
        <p className="text-red-600">{error || "Task not found"}</p>
      </main>
    );
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
        <p>Assignee: {task.assignee ? task.assignee.name : "Unassigned"}</p>

        {task.dueDate && (
          <p>Due date: {new Date(task.dueDate).toLocaleDateString()}</p>
        )}
      </div>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      <button
        onClick={() =>
          router.push(
            `/teams/${params.teamId}/projects/${params.projectId}/tasks/${params.taskId}/edit`,
          )
        }
        className="mt-6 cursor-pointer rounded-md bg-black px-4 py-2 text-white"
      >
        Edit Task
      </button>

      <button
        onClick={handleDelete}
        className="ml-3 cursor-pointer rounded-md bg-red-600 px-4 py-2 text-white"
      >
        Delete Task
      </button>
    </main>
  );
}
