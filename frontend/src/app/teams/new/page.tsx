"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTeamPage() {
  const router = useRouter();
  const [name, setName] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teams`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
        }),
      },
    );

    const data = await response.json();

    if (data.success) {
      router.push("/dashboard");
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Create Team</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
        <input
          type="text"
          placeholder="Team name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="w-full rounded-md border p-2"
        />

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
