import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../middleware/error.middleware";
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskQueryInput,
} from "../validators/task.validator";

export class TaskService {
  async getTasks(userId: string, query: TaskQueryInput) {
    const { page, limit, status, search, sortBy, order } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {
      userId,
      ...(status && { status }),
      ...(search && {
        title: { contains: search, mode: "insensitive" },
      }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.task.count({ where }),
    ]);

    return {
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTaskById(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    if (task.userId !== userId) {
      throw new AppError("Forbidden", 403);
    }

    return task;
  }

  async createTask(userId: string, input: CreateTaskInput) {
    const task = await prisma.task.create({
      data: {
        ...input,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        userId,
      },
    });

    return task;
  }

  async updateTask(taskId: string, userId: string, input: UpdateTaskInput) {
    await this.getTaskById(taskId, userId);

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...input,
        dueDate: input.dueDate !== undefined
          ? input.dueDate
            ? new Date(input.dueDate)
            : null
          : undefined,
      },
    });

    return task;
  }

  async deleteTask(taskId: string, userId: string) {
    await this.getTaskById(taskId, userId);

    await prisma.task.delete({
      where: { id: taskId },
    });
  }

  async toggleTask(taskId: string, userId: string) {
    const task = await this.getTaskById(taskId, userId);

    const statusMap: Record<string, "TODO" | "IN_PROGRESS" | "COMPLETED"> = {
      TODO: "IN_PROGRESS",
      IN_PROGRESS: "COMPLETED",
      COMPLETED: "TODO",
    };

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: statusMap[task.status] },
    });

    return updatedTask;
  }
}

export const taskService = new TaskService();
