/** @format */

import { Middleware } from "koa";
import {
  CreateCustomer,
  GetCustomers,
  GetCustomerById,
  UpdateCustomer,
} from "../services/customers-service";
import { CreateCustomerRequest } from "../models/customers/CreateCustomerRequest";
import { UpdateCustomerRequest } from "../models/customers/UpdateCustomerRequest";

export default (): { [key: string]: Middleware } => ({
  pi: async (ctx) => {
    ctx.status = 200;
    ctx.message = Math.PI.toString();
  },
  createCustomer: async (ctx) => {
    try {
      const userEmail = ctx.state.session.sub as string;
      const requestBody = ctx.request.body as CreateCustomerRequest;
      const responseBody = await CreateCustomer(userEmail, requestBody);
      ctx.status = 201;
      ctx.message = "Created";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
  updateCustomer: async (ctx) => {
    try {
      const userEmail = ctx.state.session.sub as string;
      const requestBody = ctx.request.body as UpdateCustomerRequest;
      const responseBody = await UpdateCustomer(userEmail, requestBody);
      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
  getCustomers: async (ctx) => {
    try {
      const customerName = ctx.query.customerName as string;
      const startDate = ctx.query.startDate as unknown as Date;
      const endDate = ctx.query.endDate as unknown as Date;
      const serviceTypeId = ctx.query.serviceTypeId as string;
      const pageNumber = ctx.query.pageNumber as string;
      const limit = ctx.query.limit as string;

      const userId = ctx.state.session.sub as string;

      const responseBody = await GetCustomers(
        userId,
        pageNumber,
        customerName,
        startDate,
        endDate,
        serviceTypeId,
        limit
      );

      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
  getCustomerById: async (ctx) => {
    try {
      const userId = ctx.state.session.sub as string;
      const responseBody = await GetCustomerById(userId, ctx.params.customerId);
      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
});
