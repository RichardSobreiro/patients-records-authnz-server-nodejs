/** @format */

import Router from "koa-router";
import paymentsController from "../controllers/payments.controller";
import { authenticate } from "../middlewares/auth.middleware";

export default () => {
  const router = new Router();

  const {
    createUserPaymentMethod,
    getUserPaymentMethods,
    createPayment,
    getPaymentInstalmentById,
    processRecurrentPayments,
  } = paymentsController();

  router.post("/payments/methods", authenticate, createUserPaymentMethod);
  router.get("/payments/methods", authenticate, getUserPaymentMethods);
  router.post("/payments", authenticate, createPayment);
  router.get(
    "/payments/instalments/:paymentInstalmentId",
    authenticate,
    getPaymentInstalmentById
  );
  router.post("/payments/recurrencies", authenticate, processRecurrentPayments);

  return router;
};
