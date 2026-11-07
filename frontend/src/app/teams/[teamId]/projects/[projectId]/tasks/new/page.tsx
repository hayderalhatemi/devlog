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

type TaskDraft = {
  title: string;
  description: string;
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

  const [idea, setIdea] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [draft, setDraft] = useState<TaskDraft | null>(null);

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

  async function handleAiDraft() {
    if (aiLoading || idea.trim().length < 5) return;

    setAiLoading(true);
    setAiError("");
    setDraft(null);

    try {
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/projects/${params.projectId}/tasks/draft`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idea: idea.trim() }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "AI could not write a draft.");
      }

      if (
        typeof result.data?.title !== "string" ||
        typeof result.data?.description !== "string"
      ) {
        throw new Error(
          "AI returned an unreadable draft. Please try again.",
        );
      }

      setDraft({
        title: result.data.title,
        description: result.data.description,
      });
    } catch (error) {
      setAiError(
        error instanceof Error
          ? error.message
          : "Could not reach AI. Please try again.",
      );
    } finally {
      setAiLoading(false);
    }
  }

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
        type="button"
        onClick={() =>
          router.push(`/teams/${params.teamId}/projects/${params.projectId}`)
        }
        className="mb-6 cursor-pointer"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold">Create Task</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
        <section
          className="space-y-3 rounded-md border bg-gray-50 p-4"
          aria-label="AI task writer"
          aria-busy={aiLoading}
        >
          <label className="block">
            <span className="mb-1 block font-medium">
              Describe your task idea
            </span>
            <textarea
              value={idea}
              disabled={aiLoading}
              maxLength={2000}
              onChange={(event) => {
                setIdea(event.target.value);
                setDraft(null);
              }}
              placeholder="For example: We need a dark mode"
              className="w-full rounded-md border bg-white p-2"
            />
          </label>

          <p className="text-sm text-gray-600">
            Your idea is sent to OpenAI. Check the suggestion before using it.
          </p>

          <button
            type="button"
            onClick={handleAiDraft}
            disabled={aiLoading || idea.trim().length < 5}
            className="cursor-pointer rounded-md bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {aiLoading ? "Writing…" : "Write with AI"}
          </button>

          {aiLoading && <p role="status">AI is writing your draft…</p>}

          {aiError && (
            <p role="alert" className="text-red-600">
              {aiError}
            </p>
          )}

          {draft && (
            <div className="space-y-2 rounded-md border bg-white p-3">
              <h2 className="font-semibold">{draft.title}</h2>
              <p className="whitespace-pre-wrap">{draft.description}</p>

              <p className="text-sm text-gray-600">
                Using this replaces the title and description below. You can
                edit them before saving.
              </p>

              <button
                type="button"
                onClick={() => {
                  setTitle(draft.title);
                  setDescription(draft.description);
                  setDraft(null);
                }}
                className="cursor-pointer rounded-md border px-3 py-2"
              >
                Use this draft
              </button>

              <button
                type="button"
                onClick={() => setDraft(null)}
                className="ml-3 cursor-pointer underline"
              >
                Discard
              </button>
            </div>
          )}
        </section>

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

        {error && (
          <p role="alert" className="text-red-600">
            {error}
          </p>
        )}

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