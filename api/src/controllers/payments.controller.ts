/** @format */

import { Middleware } from "koa";

import {
  createPayment,
  createUserPaymentMethod,
  getPaymentInstalmentById,
  processRecurrentPayments,
} from "../services/payments-service";
import CreateUserPaymentMethodRequest from "../models/settings/payments/CreatePaymentMethodRequest";
import CreatePaymentRequest from "../models/settings/payments/CreatePaymentRequest";

export default (): { [key: string]: Middleware } => ({
  createUserPaymentMethod: async (ctx) => {
    try {
      const userId = ctx.state.session.sub as string;
      const requestBody = ctx.request.body as CreateUserPaymentMethodRequest;

      const responseBody = await createUserPaymentMethod(userId, requestBody);

      ctx.status = 201;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
      ctx.status = 500;
      ctx.message = `${e.message || "Internal Server Error"}`;
    }
  },
  createPayment: async (ctx) => {
    try {
      const userId = ctx.state.session.sub as string;
      const requestBody = ctx.request.body as CreatePaymentRequest;

      const responseBody = await createPayment(userId, requestBody);

      ctx.status = 201;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
      ctx.status = 500;
      ctx.message = "Internal Server Error";
    }
  },
  getPaymentInstalmentById: async (ctx) => {
    try {
      const userId = ctx.state.session.sub as string;
      const paymentInstalmentId = ctx.params.paymentInstalmentId as string;

      const responseBody = await getPaymentInstalmentById(
        userId,
        paymentInstalmentId
      );

      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
      ctx.status = 500;
      ctx.message = "Internal Server Error";
    }
  },
  processRecurrentPayments: async (ctx) => {
    try {
      await processRecurrentPayments();
      ctx.status = 201;
      ctx.message = "Created";
    } catch (e: any) {
      console.log(e);
      ctx.status = 500;
      ctx.message = `${e.message || "Internal Server Error"}`;
    }
  },
});
