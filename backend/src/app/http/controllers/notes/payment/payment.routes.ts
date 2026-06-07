import { Router } from "express";
import { createOrder, getUserCredits, verifyPayment } from "../razorpayController";

export function paymentRoutes(router: Router) {
    router.post("/payment/create-order", createOrder);
    router.post("/payment/verify", verifyPayment);
    router.get("/payment/user-credits", getUserCredits);
    return router;
}
