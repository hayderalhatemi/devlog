"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function NewTeamPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/teams`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        router.push("/dashboard");
      } else {
        setError(data.message || "Failed to create team");
      }
    } catch {
      setError("Failed to create team");
    }
  }

  return (
    <main className="p-8">
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="mb-6 cursor-pointer"
      >
        ← Back
      </button>
      <h1 className="text-3xl font-bold">Create Team</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block">
            Team Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="w-full rounded-md border p-2"
          />
        </div>

        {error && (
          <p role="alert" className="text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="cursor-pointer rounded-md bg-black px-4 py-2 text-white"
        >
          Create Team
        </button>
      </form>
    </main>
  );
}
