"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams<{ teamId: string; projectId: string }>();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/projects/${params.projectId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setName(data.data.name);
          setDescription(data.data.description ?? "");
        }
      });
  }, [params.teamId, params.projectId, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/projects/${params.projectId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
        }),
      },
    );

    const data = await response.json();

    if (data.success) {
      router.push(`/teams/${params.teamId}`);
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Edit Project</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="w-full rounded-md border p-2"
        />

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-md border p-2"
        />

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
