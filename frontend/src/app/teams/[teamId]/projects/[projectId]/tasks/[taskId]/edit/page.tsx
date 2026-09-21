"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Member = {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams<{
    teamId: string;
    projectId: string;
    taskId: string;
  }>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TODO");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    Promise.all([
      apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/projects/${params.projectId}/tasks/${params.taskId}`,
      ).then((response) => response.json()),

      apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/members`,
      ).then((response) => response.json()),
    ])
      .then(([taskData, membersData]) => {
        if (taskData.success) {
          setTitle(taskData.data.title);
          setDescription(taskData.data.description ?? "");
          setStatus(taskData.data.status);
          setPriority(taskData.data.priority);
          setDueDate(
            taskData.data.dueDate ? taskData.data.dueDate.slice(0, 10) : "",
          );
          setAssigneeId(taskData.data.assigneeId ?? "");
        } else {
          setError(taskData.message || "Failed to load task");
        }

        if (membersData.success) {
          setMembers(membersData.data);
        } else {
          setError(membersData.message || "Failed to load team members");
        }
      })
      .catch(() => {
        setError("Failed to load task");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.teamId, params.projectId, params.taskId, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            status,
            priority,
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            assigneeId: assigneeId || null,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        router.push(
          `/teams/${params.teamId}/projects/${params.projectId}/tasks/${params.taskId}`,
        );
      } else {
        setError(data.message || "Failed to update task");
      }
    } catch {
      setError("Failed to update task");
    }
  }

  if (loading) {
    return <main className="p-8">Loading...</main>;
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Edit Task</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          className="w-full rounded-md border p-2"
        />

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-md border p-2"
        />

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="w-full rounded-md border p-2"
        >
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>

        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          className="w-full rounded-md border p-2"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className="w-full rounded-md border p-2"
        />

        <select
          value={assigneeId}
          onChange={(event) => setAssigneeId(event.target.value)}
          className="w-full rounded-md border p-2"
        >
          <option value="">Unassigned</option>

          {members.map((member) => (
            <option key={member.user.id} value={member.user.id}>
              {member.user.name} ({member.user.email})
            </option>
          ))}
        </select>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          className="cursor-pointer rounded-md bg-black px-4 py-2 text-white"
        >
          Save Changes
        </button>
      </form>
    </main>
  );
}
