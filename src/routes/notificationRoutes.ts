import { Router } from "express";
import { isLoggedIn, jwtCheck } from "../middleware/auth";
import { getMyNotifications, updateStatusNotification } from "../ctrls/notificationCtrl";

const router = Router();

router.get("/my-notifications", jwtCheck, isLoggedIn, getMyNotifications);
router.patch("/update-status", jwtCheck, isLoggedIn, updateStatusNotification);

export default router;