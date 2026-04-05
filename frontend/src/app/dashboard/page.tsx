"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskForm } from "@/components/tasks/task-form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useToggleTask,
} from "@/hooks/use-tasks";
import type { Task, TaskStatus, CreateTaskData, UpdateTaskData } from "@/types";

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function DashboardPage() {
  // Filter state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "ALL">("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, sortBy, order]);

  // Queries and mutations
  const { data, isLoading, isError } = useTasks({
    page,
    limit: 10,
    status: status === "ALL" ? undefined : status,
    search: debouncedSearch || undefined,
    sortBy,
    order,
  });

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleTask = useToggleTask();

  const handleCreate = useCallback(
    async (formData: CreateTaskData) => {
      try {
        await createTask.mutateAsync(formData);
        setFormOpen(false);
        toast.success("Task created successfully");
      } catch {
        toast.error("Failed to create task");
      }
    },
    [createTask]
  );

  const handleUpdate = useCallback(
    async (formData: UpdateTaskData) => {
      if (!editingTask) return;
      try {
        await updateTask.mutateAsync({ id: editingTask.id, data: formData });
        setEditingTask(null);
        toast.success("Task updated successfully");
      } catch {
        toast.error("Failed to update task");
      }
    },
    [editingTask, updateTask]
  );

  const handleDelete = useCallback(async () => {
    if (!deletingTask) return;
    try {
      await deleteTask.mutateAsync(deletingTask.id);
      setDeletingTask(null);
      toast.success("Task deleted successfully");
    } catch {
      toast.error("Failed to delete task");
    }
  }, [deletingTask, deleteTask]);

  const handleToggle = useCallback(
    async (task: Task) => {
      try {
        await toggleTask.mutateAsync(task.id);
        const nextStatus: Record<string, string> = {
          TODO: "In Progress",
          IN_PROGRESS: "Completed",
          COMPLETED: "To Do",
        };
        toast.success(`Task moved to ${nextStatus[task.status]}`);
      } catch {
        toast.error("Failed to toggle task status");
      }
    },
    [toggleTask]
  );

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
  }, []);

  const tasks = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <PageHeader title="My Tasks" description="Manage and organize your tasks">
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} className="mr-1.5" />
          Add Task
        </Button>
      </PageHeader>

      <TaskFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        order={order}
        onOrderChange={setOrder}
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load tasks"
          description="Something went wrong while fetching your tasks. Please try again."
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          title={debouncedSearch || status !== "ALL" ? "No matching tasks" : "No tasks yet"}
          description={
            debouncedSearch || status !== "ALL"
              ? "Try adjusting your search or filters."
              : "Get started by creating your first task."
          }
        >
          {!debouncedSearch && status === "ALL" && (
            <Button onClick={() => setFormOpen(true)}>
              <Plus size={16} className="mr-1.5" />
              Create your first task
            </Button>
          )}
        </EmptyState>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={setDeletingTask}
                onToggle={handleToggle}
              />
            ))}
          </div>
          {pagination && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Create Task Dialog */}
      <TaskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isLoading={createTask.isPending}
      />

      {/* Edit Task Dialog */}
      <TaskForm
        key={editingTask?.id}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSubmit={handleUpdate}
        task={editingTask}
        isLoading={updateTask.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingTask}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        title="Delete Task"
        description={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteTask.isPending}
      />
    </div>
  );
}
