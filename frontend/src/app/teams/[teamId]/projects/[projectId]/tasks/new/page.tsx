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

export default function NewTaskPage() {
  const router = useRouter();
  const params = useParams<{ teamId: string; projectId: string }>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    apiFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/members`,
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setMembers(data.data);
        } else {
          setError(data.message || "Failed to load team members");
        }
      })
      .catch(() => {
        setError("Failed to load team members");
      });
  }, [params.teamId, router]);

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/projects/${params.projectId}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            priority,
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            assigneeId: assigneeId || null,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        router.push(`/teams/${params.teamId}/projects/${params.projectId}`);
      } else {
        setError(data.message || "Failed to create task");
      }
    } catch {
      setError("Failed to create task");
    }
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

      <h1 className="text-3xl font-bold">Create Task</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
        <label className="block">
          <span className="mb-1 block font-medium">Title</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className="w-full rounded-md border p-2"
          />
        </label>

        <label className="block">
          <span className="mb-1 block font-medium">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded-md border p-2"
          />
        </label>

        <label className="block">
          <span className="mb-1 block font-medium">Priority</span>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="w-full rounded-md border p-2"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block font-medium">Due Date</span>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="w-full rounded-md border p-2"
          />
        </label>

        <label className="block">
          <span className="mb-1 block font-medium">Assignee</span>
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
        </label>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          className="cursor-pointer rounded-md bg-black px-4 py-2 text-white"
        >
          Create Task
        </button>
      </form>
    </main>
  );
}
