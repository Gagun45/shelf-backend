import { Router } from "express";
import { createOrder, getMyOrders } from "../ctrls/orderCtrl";
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = Router();

router.get("/my-orders", jwtCheck, jwtParse, getMyOrders);

router.post("/create-order", jwtCheck, jwtParse, createOrder);

export default router;
