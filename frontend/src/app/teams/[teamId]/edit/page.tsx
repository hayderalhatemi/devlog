"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditTeamPage() {
  const router = useRouter();
  const params = useParams<{ teamId: string }>();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setName(data.data.name);
        } else {
          setError(data.message || "Failed to load team");
        }
      })
      .catch(() => {
        setError("Failed to load team");
      })
      .finally(() => {
        setLoading(false);
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}`,
        {
          method: "PATCH",
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
      } else {
        setError(data.message || "Failed to update team");
      }
    } catch {
      setError("Failed to update team");
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this team?",
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        router.push("/dashboard");
      } else {
        setError(data.message || "Failed to delete team");
      }
    } catch {
      setError("Failed to delete team");
    }
  }

  if (loading) {
    return <main className="p-8">Loading...</main>;
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Edit Team</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="w-full rounded-md border p-2"
        />

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          className="cursor-pointer rounded-md bg-black px-4 py-2 text-white"
        >
          Save Changes
        </button>
      </form>

      <button
        onClick={handleDelete}
        className="mt-4 cursor-pointer rounded-md bg-red-600 px-4 py-2 text-white"
      >
        Delete Team
      </button>
    </main>
  );
}
