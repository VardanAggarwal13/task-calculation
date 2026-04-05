import { Router } from "express";
import { taskController } from "../controllers/task.controller";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from "../validators/task.validator";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  validate(taskQuerySchema, "query"),
  taskController.getTasks.bind(taskController)
);

router.post(
  "/",
  validate(createTaskSchema),
  taskController.createTask.bind(taskController)
);

router.get("/:id", taskController.getTaskById.bind(taskController));

router.patch(
  "/:id",
  validate(updateTaskSchema),
  taskController.updateTask.bind(taskController)
);

router.delete("/:id", taskController.deleteTask.bind(taskController));

router.patch("/:id/toggle", taskController.toggleTask.bind(taskController));

export default router;
