/** @format */
import { Middleware, Request } from "koa";
import { CreateServiceRequest } from "../models/customers/services/CreateServiceRequest";
import { createService } from "../services/create.service-service";
import {
  getServiceById,
  getServices,
  getServicesAgenda,
} from "../services/get.services-service";
import { UpdateServiceRequest } from "../models/customers/services/UpdateServiceRequest";
import { updateService } from "../services/update.services-service";
import { GetServiceTypeResponse } from "../models/customers/services/service-types/GetServiceTypesResponse";

interface MulterRequest extends Request {
  files: any;
}

export default (): { [key: string]: Middleware } => ({
  createService: async (ctx) => {
    try {
      const files = (ctx.request as MulterRequest).files;
      const requestBody = ctx.request.body as CreateServiceRequest;
      requestBody.serviceTypes = JSON.parse(
        (ctx.request.body! as any).serviceTypes
      ) as GetServiceTypeResponse[];
      const customerId = ctx.params.customerId;
      const userId = ctx.state.session.sub as string;

      const responseBody = await createService(
        userId,
        customerId,
        requestBody,
        files
      );

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
  getServiceById: async (ctx) => {
    try {
      const customerId = ctx.params.customerId;
      const serviceId = ctx.params.serviceId;

      const responseBody = await getServiceById(customerId, serviceId);

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
  updateService: async (ctx) => {
    try {
      const files = (ctx.request as MulterRequest).files;
      const requestBody = ctx.request.body as UpdateServiceRequest;
      requestBody.serviceTypes = JSON.parse(
        (ctx.request.body! as any).serviceTypes
      ) as GetServiceTypeResponse[];
      const customerId = ctx.params.customerId;
      const serviceId = ctx.params.serviceId;
      const userId = ctx.state.session.sub as string;

      const responseBody = await updateService(
        userId,
        customerId,
        serviceId,
        requestBody,
        files
      );

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
  getServices: async (ctx) => {
    try {
      const customerId = ctx.params.customerId;
      const pageNumber = ctx.query.pageNumber as string;
      const limit = ctx.query.limit as string;
      const startDate = ctx.query.startDate as unknown as Date;
      const endDate = ctx.query.endDate as unknown as Date;
      const serviceTypeIds = ctx.query.serviceTypeIds as string[];
      const serviceTypeDescription = ctx.query.serviceTypeDescription as string;
      const userId = ctx.state.session.sub as string;

      const responseBody = await getServices(
        userId,
        customerId,
        pageNumber,
        limit,
        startDate,
        endDate,
        serviceTypeIds,
        serviceTypeDescription
      );

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
  getServicesAgenda: async (ctx) => {
    try {
      const startDate = ctx.query.startDate as unknown as Date;
      const endDate = ctx.query.endDate as unknown as Date;
      const userId = ctx.state.session.sub as string;

      const responseBody = await getServicesAgenda(userId, startDate, endDate);

      ctx.status = 200;
      ctx.message = "Ok";
      ctx.response.body = JSON.stringify(responseBody);
      ctx.response.headers["Content-Type"] = "application/json";
    } catch (e: any) {
      console.log(e);
      ctx.status = 400;
      ctx.message = "Bad Request";
      ctx.response.body = { message: e.message, stackTrace: e.stack };
    }
  },
});
