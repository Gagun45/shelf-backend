import { Router } from "express";
import { jwtCheck } from "../middleware/auth";
import { createUser } from "../ctrls/authCtrl";


const router = Router();

router.post("/create-user", jwtCheck, createUser);

export default router;
