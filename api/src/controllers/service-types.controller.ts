/** @format */

import { Middleware } from "koa";
import { CreateServiceTypeRequest } from "../models/customers/services/service-types/CreateServiceTypeRequest";
import {
  CreateServiceType,
  GetServiceTypeById,
  GetServicesTypes,
  UpdateServiceType,
} from "../services/service.types-service";
import { UpdateServiceTypeRequest } from "../models/customers/services/service-types/UpdateServiceTypeRequest";

export default (): { [key: string]: Middleware } => ({
  createServiceType: async (ctx) => {
    try {
      const userId = ctx.state.session.sub as string;
      const requestBody = ctx.request.body as CreateServiceTypeRequest;
      const responseBody = await CreateServiceType(userId, requestBody);
      ctx.status = 201;
      ctx.message = "Created";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
  getServiceTypeById: async (ctx) => {
    try {
      const userId = ctx.state.session.sub as string;
      const serviceTypeId = ctx.params.serviceTypeId as string;

      const responseBody = await GetServiceTypeById(userId, serviceTypeId);

      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
  updateServiceType: async (ctx) => {
    try {
      const userId = ctx.state.session.sub as string;
      const requestBody = ctx.request.body as UpdateServiceTypeRequest;

      const responseBody = await UpdateServiceType(userId, requestBody);

      ctx.status = 200;
      ctx.message = "Ok";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
  getServiceTypeList: async (ctx) => {
    try {
      const userId = ctx.state.session.sub as string;
      const serviceTypeDescription = ctx.query.serviceTypeDescription as string;

      const responseBody = await GetServicesTypes(
        userId,
        serviceTypeDescription
      );

      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
});
