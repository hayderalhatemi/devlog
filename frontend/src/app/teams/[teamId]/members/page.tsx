"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Member = {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type JwtPayload = {
  userId: string;
};

export default function MembersPage() {
  const router = useRouter();
  const params = useParams<{ teamId: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [currentRole, setCurrentRole] = useState<Member["role"] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    let payload: JwtPayload;

    try {
      payload = JSON.parse(atob(token.split(".")[1])) as JwtPayload;
    } catch {
      localStorage.removeItem("token");
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

          const currentMember = data.data.find(
            (member: Member) => member.user.id === payload.userId,
          );

          setCurrentRole(currentMember?.role ?? null);
        } else {
          setError(data.message || "Failed to load team members");
        }
      })
      .catch(() => {
        setError("Failed to load team members");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.teamId, router]);

  const isOwner = currentRole === "OWNER";

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setMembers((currentMembers) => [...currentMembers, data.data]);
        setEmail("");
      } else {
        setError(data.message || "Failed to add member");
      }
    } catch {
      setError("Failed to add member");
    }
  }

  async function handleRoleChange(userId: string, role: "ADMIN" | "MEMBER") {
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/members/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setMembers((currentMembers) =>
          currentMembers.map((member) =>
            member.user.id === userId ? { ...member, role } : member,
          ),
        );
      } else {
        setError(data.message || "Failed to update member role");
      }
    } catch {
      setError("Failed to update member role");
    }
  }

  async function handleRemoveMember(userId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this member?",
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/members/${userId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (data.success) {
        setMembers((currentMembers) =>
          currentMembers.filter((member) => member.user.id !== userId),
        );
      } else {
        setError(data.message || "Failed to remove member");
      }
    } catch {
      setError("Failed to remove member");
    }
  }

  async function handleTransferOwnership(userId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to transfer team ownership?",
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/owner/${userId}`,
        {
          method: "PATCH",
        },
      );

      const data = await response.json();

      if (data.success) {
        window.location.reload();
      } else {
        setError(data.message || "Failed to transfer ownership");
      }
    } catch {
      setError("Failed to transfer ownership");
    }
  }

  if (loading) {
    return <p className="p-8">Loading...</p>;
  }

  return (
    <main className="p-8">
      <button
        onClick={() => router.push(`/teams/${params.teamId}`)}
        className="mb-6 cursor-pointer"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold">Team Members</h1>

      {isOwner && (
        <form
          onSubmit={handleAddMember}
          className="mt-6 flex max-w-md flex-wrap gap-3"
        >
          <input
            type="email"
            placeholder="Member email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="flex-1 rounded-md border p-2"
          />

          <button
            type="submit"
            className="cursor-pointer rounded-md bg-black px-4 py-2 text-white"
          >
            Add Member
          </button>
        </form>
      )}

      {error && <p className="mt-2 text-red-600">{error}</p>}

      <div className="mt-6 space-y-3">
        {members.map((member) => (
          <div key={member.id} className="rounded-md border p-4">
            <p className="font-semibold">{member.user.name}</p>
            <p className="text-gray-600">{member.user.email}</p>

            {member.role === "OWNER" || !isOwner ? (
              <p className="mt-1 text-sm">{member.role}</p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-3">
                <select
                  value={member.role}
                  onChange={(event) =>
                    handleRoleChange(
                      member.user.id,
                      event.target.value as "ADMIN" | "MEMBER",
                    )
                  }
                  className="rounded-md border p-2"
                >
                  <option value="MEMBER">MEMBER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>

                <button
                  onClick={() => handleRemoveMember(member.user.id)}
                  className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-white"
                >
                  Remove
                </button>

                <button
                  onClick={() => handleTransferOwnership(member.user.id)}
                  className="cursor-pointer rounded-md border px-4 py-2"
                >
                  Transfer Ownership
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
