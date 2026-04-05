import { Response, NextFunction } from "express";
import { taskService } from "../services/task.service";
import { AuthRequest } from "../types";

export class TaskController {
  async getTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await taskService.getTasks(req.user!.userId, res.locals.validatedQuery);
      res.status(200).json({
        success: true,
        message: "Tasks retrieved successfully",
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const task = await taskService.getTaskById(taskId, req.user!.userId);
      res.status(200).json({
        success: true,
        message: "Task retrieved successfully",
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async createTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.createTask(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const task = await taskService.updateTask(
        taskId,
        req.user!.userId,
        req.body
      );
      res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await taskService.deleteTask(taskId, req.user!.userId);
      res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const task = await taskService.toggleTask(taskId, req.user!.userId);
      res.status(200).json({
        success: true,
        message: "Task status toggled successfully",
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
