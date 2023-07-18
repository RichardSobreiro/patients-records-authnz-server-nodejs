/** @format */
import { Middleware, Request } from "koa";
import { CreateServiceRequest } from "../models/customers/services/CreateServiceRequest";
import { createProceeding } from "../services/create.proceedings";
import { getProceedingById, getProceedings } from "../services/get.proceedings";
import { UpdateCustomerMostRecentProceedingProperties } from "../services/customers";
import { UpdateServiceRequest } from "../models/customers/services/UpdateServiceRequest";
import { updateProceeding } from "../services/update.proceedings";

interface MulterRequest extends Request {
  files: any;
}

export default (): { [key: string]: Middleware } => ({
  createProceeding: async (ctx) => {
    try {
      const files = (ctx.request as MulterRequest).files;
      const requestBody = ctx.request.body as CreateServiceRequest;
      const customerId = ctx.params.customerId;
      const userId = ctx.state.session.sub as string;

      const responseBody = await createProceeding(
        userId,
        customerId,
        requestBody,
        files
      );

      await UpdateCustomerMostRecentProceedingProperties(userId, customerId);

      ctx.status = 201;
      ctx.message = "Created";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
      ctx.status = 400;
      ctx.message = "Bad Request";
      ctx.response.body = { message: e.message, stackTrace: e.stack };
    }
  },
  updateProceeding: async (ctx) => {
    try {
      const files = (ctx.request as MulterRequest).files;
      const requestBody = ctx.request.body as UpdateServiceRequest;
      const customerId = ctx.params.customerId;
      const serviceId = ctx.params.serviceId;
      const userId = ctx.state.session.sub as string;

      const responseBody = await updateProceeding(
        userId,
        customerId,
        serviceId,
        requestBody,
        files
      );

      await UpdateCustomerMostRecentProceedingProperties(userId, customerId);

      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
      ctx.status = 400;
      ctx.message = "Bad Request";
      ctx.response.body = { message: e.message, stackTrace: e.stack };
    }
  },
  getProceedingById: async (ctx) => {
    try {
      const customerId = ctx.params.customerId;
      const serviceId = ctx.params.serviceId;

      const responseBody = await getProceedingById(customerId, serviceId);

      ctx.status = 200;
      ctx.message = "Ok";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
      ctx.status = 400;
      ctx.message = "Bad Request";
      ctx.response.body = { message: e.message, stackTrace: e.stack };
    }
  },
  getProceedings: async (ctx) => {
    try {
      const customerId = ctx.params.customerId;
      const pageNumber = ctx.query.pageNumber as string;
      const limit = ctx.query.limit as string;

      const responseBody = await getProceedings(customerId, pageNumber, limit);

      ctx.status = 200;
      ctx.message = "Ok";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
      ctx.status = 400;
      ctx.message = "Bad Request";
      ctx.response.body = { message: e.message, stackTrace: e.stack };
    }
  },
});
