import { Router } from "express";
import { jwtCheck } from "../middleware/auth";
import { createUser, getUserData } from "../ctrls/authCtrl";

const router = Router();

router.get("/get-user", jwtCheck, getUserData);
router.post("/create-user", jwtCheck, createUser);

export default router;
