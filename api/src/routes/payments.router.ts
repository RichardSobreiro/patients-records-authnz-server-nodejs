/** @format */

import Router from "koa-router";
import paymentsController from "../controllers/payments.controller";
import { authenticate } from "../middlewares/auth.middleware";

export default () => {
  const router = new Router();

  const { createUserPaymentMethod, createPayment, getPaymentInstalmentById } =
    paymentsController();

  router.post("/payments/methods", authenticate, createUserPaymentMethod);
  router.post("/payments", authenticate, createPayment);
  router.get(
    "/payments/instalments/:paymentInstalmentId",
    authenticate,
    getPaymentInstalmentById
  );

  return router;
};
