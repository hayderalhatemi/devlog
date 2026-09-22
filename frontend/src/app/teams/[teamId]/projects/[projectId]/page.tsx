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

type Member = {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type Meta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams<{ teamId: string; projectId: string }>();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/members`,
      ).then((response) => response.json()),
    ])
      .then(([projectData, membersData]) => {
        if (projectData.success) {
          setProjectName(projectData.data.name);
          setProjectDescription(projectData.data.description);
        } else {
          setError(projectData.message || "Failed to load project");
        }

        if (membersData.success) {
          setMembers(membersData.data);
        } else {
          setError(membersData.message || "Failed to load members");
        }
      })
      .catch(() => {
        setError("Failed to load project");
      });
  }, [params.projectId, params.teamId, router]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const query = new URLSearchParams();

    query.set("page", page.toString());
    query.set("limit", "10");

    if (statusFilter !== "ALL") {
      query.set("status", statusFilter);
    }

    if (priorityFilter !== "ALL") {
      query.set("priority", priorityFilter);
    }

    if (assigneeFilter !== "ALL") {
      query.set("assigneeId", assigneeFilter);
    }

    if (debouncedSearch.trim()) {
      query.set("search", debouncedSearch.trim());
    }

    if (sortBy === "NEWEST") {
      query.set("sortBy", "createdAt");
      query.set("sortOrder", "desc");
    }

    if (sortBy === "DUE_DATE") {
      query.set("sortBy", "dueDate");
      query.set("sortOrder", "asc");
    }

    if (sortBy === "PRIORITY") {
      query.set("sortBy", "priority");
      query.set("sortOrder", "desc");
    }

    apiFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/teams/${params.teamId}/projects/${params.projectId}/tasks?${query.toString()}`,
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setTasks(data.data);
          setMeta(data.meta);
        } else {
          setError(data.message || "Failed to load tasks");
        }
      })
      .catch(() => {
        setError("Failed to load tasks");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    params.projectId,
    params.teamId,
    page,
    statusFilter,
    priorityFilter,
    assigneeFilter,
    sortBy,
    debouncedSearch,
  ]);

  function resetPage() {
    setPage(1);
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
            onChange={(event) => {
              setStatusFilter(
                event.target.value as "ALL" | "TODO" | "IN_PROGRESS" | "DONE",
              );
              resetPage();
            }}
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
            onChange={(event) => {
              setPriorityFilter(
                event.target.value as "ALL" | "LOW" | "MEDIUM" | "HIGH",
              );
              resetPage();
            }}
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
            onChange={(event) => {
              setAssigneeFilter(event.target.value);
              resetPage();
            }}
            className="rounded-md border px-3 py-2"
          >
            <option value="ALL">All Assignees</option>
            <option value="UNASSIGNED">Unassigned</option>

            {members.map((member) => (
              <option key={member.user.id} value={member.user.id}>
                {member.user.name}
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
            onChange={(event) => {
              setSortBy(
                event.target.value as "NEWEST" | "DUE_DATE" | "PRIORITY",
              );
              resetPage();
            }}
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
            onChange={(event) => {
              setSearch(event.target.value);
              resetPage();
            }}
            className="rounded-md border px-3 py-2"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-red-600">
          {error}
        </p>
      )}

      {loading && (
        <p role="status" className="mt-6">
          Loading...
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="mt-6 space-y-3" aria-live="polite">
            {tasks.length === 0 && (
              <p className="text-gray-600">No tasks match this filter.</p>
            )}

            {tasks.map((task) => (
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
                    <span>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>

          {meta.totalPages > 1 && (
            <div className="mt-6 flex items-center gap-4">
              <button
                type="button"
                disabled={!meta.hasPrevPage}
                onClick={() => setPage((currentPage) => currentPage - 1)}
                className="cursor-pointer rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <span>
                Page {meta.page} of {meta.totalPages}
              </span>

              <button
                type="button"
                disabled={!meta.hasNextPage}
                onClick={() => setPage((currentPage) => currentPage + 1)}
                className="cursor-pointer rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
