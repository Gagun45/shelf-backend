import { Router } from "express";
import { createOrder, editOrder, getAllOrders, getMyOrders } from "../ctrls/orderCtrl";
import { isLoggedIn, isSuperAdmin, jwtCheck } from "../middleware/auth";

const router = Router();

router.get("/my-orders", jwtCheck, isLoggedIn, getMyOrders);

router.get('/all-orders', jwtCheck, isLoggedIn, isSuperAdmin, getAllOrders )

router.post("/create-order", jwtCheck, isLoggedIn, createOrder);

router.patch('/edit-order', jwtCheck, isLoggedIn, isSuperAdmin, editOrder)

export default router;
