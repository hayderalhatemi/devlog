"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function NewTaskPage() {
  const router = useRouter();
  const params = useParams<{ teamId: string; projectId: string }>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/projects/${params.projectId}/tasks`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          priority,
        }),
      },
    );

    const data = await response.json();

    if (data.success) {
      router.push(`/teams/${params.teamId}/projects/${params.projectId}`);
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Create Task</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          className="w-full rounded-md border p-2"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-md border p-2"
        />

        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          className="w-full rounded-md border p-2"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

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
