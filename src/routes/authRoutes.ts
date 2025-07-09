import { Router } from "express";
import { jwtCheck } from "../middleware/auth";
import { createUser, getUserData } from "../ctrls/authCtrl";
import validateRequest from "../middleware/validateRequest";
import { createUserSchema } from "../validators/user.validator";

const router = Router();

router.get("/get-user", jwtCheck, getUserData);
router.post(
  "/create-user",
  jwtCheck,
  validateRequest(createUserSchema),
  createUser
);

export default router;
