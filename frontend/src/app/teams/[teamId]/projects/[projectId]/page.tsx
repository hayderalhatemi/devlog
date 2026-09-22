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
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams<{ teamId: string; projectId: string }>();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState<string | null>(
    null,
  );

  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "TODO" | "IN_PROGRESS" | "DONE"
  >("ALL");

  const [priorityFilter, setPriorityFilter] = useState<
    "ALL" | "LOW" | "MEDIUM" | "HIGH"
  >("ALL");

  const [assigneeFilter, setAssigneeFilter] = useState("ALL");

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
          setProjectDescription(projectData.data.description);
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

  const assignees = Array.from(
    new Map(
      tasks
        .filter((task) => task.assignee)
        .map((task) => [task.assignee!.id, task.assignee!]),
    ).values(),
  );

  const filteredTasks = tasks
    .filter((task) => {
      const matchesStatus =
        statusFilter === "ALL" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || task.priority === priorityFilter;

      const matchesAssignee =
        assigneeFilter === "ALL" ||
        (assigneeFilter === "UNASSIGNED" && !task.assignee) ||
        task.assignee?.id === assigneeFilter;

      const matchesSearch = task.title
        .toLowerCase()
        .includes(search.toLowerCase());

      return (
        matchesStatus && matchesPriority && matchesAssignee && matchesSearch
      );
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
    return (
      <main className="p-8">
        <p role="status">Loading...</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <button
        type="button"
        onClick={() => router.push(`/teams/${params.teamId}`)}
        className="mb-6 cursor-pointer"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold">{projectName}</h1>

      {projectDescription && (
        <p className="mt-1 text-gray-600">{projectDescription}</p>
      )}

      <h2 className="mt-4 text-xl font-semibold">Tasks</h2>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <button
          type="button"
          onClick={() =>
            router.push(
              `/teams/${params.teamId}/projects/${params.projectId}/tasks/new`,
            )
          }
          className="cursor-pointer rounded-md bg-black px-4 py-2 text-white"
        >
          New Task
        </button>

        <button
          type="button"
          onClick={() =>
            router.push(
              `/teams/${params.teamId}/projects/${params.projectId}/edit`,
            )
          }
          className="cursor-pointer rounded-md border px-4 py-2"
        >
          Edit Project
        </button>

        <div>
          <label htmlFor="status-filter" className="mb-1 block text-sm">
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as "ALL" | "TODO" | "IN_PROGRESS" | "DONE",
              )
            }
            className="rounded-md border px-3 py-2"
          >
            <option value="ALL">All Tasks</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority-filter" className="mb-1 block text-sm">
            Priority
          </label>
          <select
            id="priority-filter"
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(
                event.target.value as "ALL" | "LOW" | "MEDIUM" | "HIGH",
              )
            }
            className="rounded-md border px-3 py-2"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="assignee-filter" className="mb-1 block text-sm">
            Assignee
          </label>
          <select
            id="assignee-filter"
            value={assigneeFilter}
            onChange={(event) => setAssigneeFilter(event.target.value)}
            className="rounded-md border px-3 py-2"
          >
            <option value="ALL">All Assignees</option>
            <option value="UNASSIGNED">Unassigned</option>

            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sort-by" className="mb-1 block text-sm">
            Sort by
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                event.target.value as "NEWEST" | "DUE_DATE" | "PRIORITY",
              )
            }
            className="rounded-md border px-3 py-2"
          >
            <option value="NEWEST">Newest</option>
            <option value="DUE_DATE">Due Date</option>
            <option value="PRIORITY">Priority</option>
          </select>
        </div>

        <div>
          <label htmlFor="task-search" className="mb-1 block text-sm">
            Search
          </label>
          <input
            id="task-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded-md border px-3 py-2"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-red-600">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-3" aria-live="polite">
        {!error && tasks.length === 0 && (
          <p className="text-gray-600">No tasks yet.</p>
        )}

        {!error && tasks.length > 0 && filteredTasks.length === 0 && (
          <p className="text-gray-600">No tasks match this filter.</p>
        )}

        {filteredTasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() =>
              router.push(
                `/teams/${params.teamId}/projects/${params.projectId}/tasks/${task.id}`,
              )
            }
            className="block w-full cursor-pointer rounded-md border p-4 text-left hover:bg-gray-50"
          >
            <span className="block font-semibold">{task.title}</span>

            <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              <span>Status: {task.status}</span>
              <span>Priority: {task.priority}</span>

              {task.assignee && <span>Assignee: {task.assignee.name}</span>}

              {task.dueDate && (
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              )}
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}
