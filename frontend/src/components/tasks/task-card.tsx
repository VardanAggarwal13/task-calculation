"use client";

import { format } from "date-fns";
import { Calendar, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task } from "@/types";

const statusConfig = {
  TODO: { label: "To Do", className: "border-blue-300 text-blue-700 bg-blue-50" },
  IN_PROGRESS: { label: "In Progress", className: "border-yellow-300 text-yellow-700 bg-yellow-50" },
  COMPLETED: { label: "Completed", className: "border-green-300 text-green-700 bg-green-50" },
};

const priorityConfig = {
  LOW: { label: "Low", className: "border-gray-300 text-gray-600 bg-gray-50" },
  MEDIUM: { label: "Medium", className: "border-orange-300 text-orange-700 bg-orange-50" },
  HIGH: { label: "High", className: "border-red-300 text-red-700 bg-red-50" },
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggle: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete, onToggle }: TaskCardProps) {
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <div className="flex-1 space-y-1">
          <h3
            className={`font-semibold leading-tight ${
              task.status === "COMPLETED" ? "line-through text-muted-foreground" : ""
            }`}
          >
            {task.title}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <Badge
              variant="outline"
              className={`cursor-pointer text-xs ${status.className}`}
              onClick={() => onToggle(task)}
            >
              {status.label}
            </Badge>
            <Badge variant="outline" className={`text-xs ${priority.className}`}>
              {priority.label}
            </Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted">
            <MoreVertical size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Pencil size={14} className="mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(task)}>
              <Trash2 size={14} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pt-0">
        {task.description && (
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{task.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {format(new Date(task.dueDate), "MMM d, yyyy")}
            </span>
          )}
          <span>Created {format(new Date(task.createdAt), "MMM d, yyyy")}</span>
        </div>
      </CardContent>
    </Card>
  );
}
