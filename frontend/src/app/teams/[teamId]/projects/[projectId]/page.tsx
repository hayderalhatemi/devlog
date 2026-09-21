"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Task = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | null;
};

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams<{ teamId: string; projectId: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "TODO" | "IN_PROGRESS" | "DONE"
  >("ALL");
  const [priorityFilter, setPriorityFilter] = useState<
    "ALL" | "LOW" | "MEDIUM" | "HIGH"
  >("ALL");
  const [sortBy, setSortBy] = useState<"NEWEST" | "DUE_DATE" | "PRIORITY">(
    "NEWEST",
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    Promise.all([
      apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/projects/${params.projectId}`,
      ).then((response) => response.json()),

      apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/projects/${params.projectId}/tasks`,
      ).then((response) => response.json()),
    ])
      .then(([projectData, tasksData]) => {
        if (projectData.success) {
          setProjectName(projectData.data.name);
        } else {
          setError(projectData.message || "Failed to load project");
        }

        if (tasksData.success) {
          setTasks(tasksData.data);
        } else {
          setError(tasksData.message || "Failed to load tasks");
        }
      })
      .catch(() => {
        setError("Failed to load project");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.projectId, params.teamId, router]);

  const filteredTasks = tasks
    .filter((task) => {
      const matchesStatus =
        statusFilter === "ALL" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || task.priority === priorityFilter;

      const matchesSearch = task.title
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesStatus && matchesPriority && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "DUE_DATE") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      if (sortBy === "PRIORITY") {
        const priorityOrder = {
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1,
        };

        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }

      return 0;
    });

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

      <h1 className="text-3xl font-bold">{projectName}</h1>
      <p className="mt-1 text-gray-600">Tasks</p>

      <button
        onClick={() =>
          router.push(
            `/teams/${params.teamId}/projects/${params.projectId}/tasks/new`,
          )
        }
        className="mt-4 cursor-pointer rounded-md bg-black px-4 py-2 text-white"
      >
        New Task
      </button>

      <button
        onClick={() =>
          router.push(
            `/teams/${params.teamId}/projects/${params.projectId}/edit`,
          )
        }
        className="mt-4 ml-3 cursor-pointer rounded-md border px-4 py-2"
      >
        Edit Project
      </button>

      <select
        value={statusFilter}
        onChange={(event) =>
          setStatusFilter(
            event.target.value as "ALL" | "TODO" | "IN_PROGRESS" | "DONE",
          )
        }
        className="mt-4 ml-3 rounded-md border px-3 py-2"
      >
        <option value="ALL">All Tasks</option>
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>

      <select
        value={priorityFilter}
        onChange={(event) =>
          setPriorityFilter(
            event.target.value as "ALL" | "LOW" | "MEDIUM" | "HIGH",
          )
        }
        className="mt-4 ml-3 rounded-md border px-3 py-2"
      >
        <option value="ALL">All Priorities</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>

      <select
        value={sortBy}
        onChange={(event) =>
          setSortBy(event.target.value as "NEWEST" | "DUE_DATE" | "PRIORITY")
        }
        className="mt-4 ml-3 rounded-md border px-3 py-2"
      >
        <option value="NEWEST">Newest</option>
        <option value="DUE_DATE">Due Date</option>
        <option value="PRIORITY">Priority</option>
      </select>

      <input
        type="text"
        placeholder="Search tasks..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="mt-4 ml-3 rounded-md border px-3 py-2"
      />

      {error && <p className="mt-4 text-red-600">{error}</p>}

      <div className="mt-6 space-y-3">
        {!error && tasks.length === 0 && (
          <p className="text-gray-600">No tasks yet.</p>
        )}

        {!error && tasks.length > 0 && filteredTasks.length === 0 && (
          <p className="text-gray-600">No tasks match this filter.</p>
        )}

        {filteredTasks.map((task) => (
          <div
            key={task.id}
            onClick={() =>
              router.push(
                `/teams/${params.teamId}/projects/${params.projectId}/tasks/${task.id}`,
              )
            }
            className="cursor-pointer rounded-md border p-4 hover:bg-gray-50"
          >
            <h2 className="font-semibold">{task.title}</h2>

            <div className="mt-2 flex gap-4 text-sm text-gray-600">
              <span>{task.status}</span>
              <span>{task.priority}</span>

              {task.dueDate && (
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
