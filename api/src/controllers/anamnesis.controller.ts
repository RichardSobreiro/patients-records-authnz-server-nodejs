/** @format */

import { Middleware } from "koa";
import {
  CreateAnamneseRequest,
  CreateAnamnesisTypeContentRequest,
} from "../models/customers/CreateAnamneseRequest";
import {
  CreateAnamnesis,
  GetAnamnesisById,
  GetAnamnesisListAsync,
  UpdateAnamnesis,
} from "../services/anamnesis-service";
import {
  UpdateAnamnesisRequest,
  UpdateAnamnesisTypeContentRequest,
} from "../models/customers/UpdateAnamnesisRequest";

interface MulterRequest extends Request {
  files: any;
}

export default (): { [key: string]: Middleware } => ({
  createAnamnesis: async (ctx) => {
    try {
      const userEmail = ctx.state.session.sub as string;
      const requestBody = ctx.request.body as CreateAnamneseRequest;
      requestBody.anamnesisTypesContent = JSON.parse(
        (ctx.request.body! as any).anamnesisTypesContent
      ) as CreateAnamnesisTypeContentRequest[];
      const files = (ctx.request as unknown as MulterRequest).files;

      const responseBody = await CreateAnamnesis(userEmail, requestBody, files);

      ctx.status = 201;
      ctx.message = "Created";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
  updateAnamnesis: async (ctx) => {
    try {
      const userEmail = ctx.state.session.sub as string;
      const requestBody = ctx.request.body as UpdateAnamnesisRequest;
      requestBody.anamnesisTypesContent = JSON.parse(
        (ctx.request.body! as any).anamnesisTypesContent
      ) as UpdateAnamnesisTypeContentRequest[];
      const files = (ctx.request as unknown as MulterRequest).files;

      const responseBody = await UpdateAnamnesis(userEmail, requestBody, files);

      ctx.status = 200;
      ctx.message = "Ok";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
  getAnamnesisList: async (ctx) => {
    try {
      const userId = ctx.state.session.sub as string;
      const pageNumber = ctx.query.pageNumber as string;
      const customerId = ctx.query.customerId as string;
      const startDate = ctx.query.startDate as unknown as Date;
      const endDate = ctx.query.endDate as unknown as Date;
      const anamnesisTypeIds = ctx.query.anamnesisTypeIds as string[];
      const limit = ctx.query.limit as string;

      const responseBody = await GetAnamnesisListAsync(
        userId,
        pageNumber,
        customerId,
        startDate,
        endDate,
        anamnesisTypeIds,
        limit
      );

      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
  getAnamnesisById: async (ctx) => {
    try {
      const userId = ctx.state.session.sub as string;
      const customerId = ctx.params.customerId;
      const anamnesisId = ctx.params.anamnesisId;

      const responseBody = await GetAnamnesisById(
        userId,
        customerId,
        anamnesisId
      );

      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
});
