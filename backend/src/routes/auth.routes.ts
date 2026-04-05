import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "../validators/auth.validator";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  authController.register.bind(authController)
);

router.post(
  "/login",
  validate(loginSchema),
  authController.login.bind(authController)
);

router.post(
  "/refresh",
  validate(refreshSchema),
  authController.refresh.bind(authController)
);

router.post(
  "/logout",
  authenticate,
  authController.logout.bind(authController)
);

export default router;
