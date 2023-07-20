/** @format */

import { Middleware } from "koa";
import { CreateAnamneseRequest } from "../models/customers/CreateAnamneseRequest";
import {
  CreateAnamnesis,
  GetAnamnesisById,
  GetAnamnesisListAsync,
  UpdateAnamnesis,
} from "../services/anamnesis-service";
import { UpdateAnamnesisRequest } from "../models/customers/UpdateAnamnesisRequest";

export default (): { [key: string]: Middleware } => ({
  createAnamnesis: async (ctx) => {
    try {
      const userEmail = ctx.state.session.sub as string;
      const requestBody = ctx.request.body as CreateAnamneseRequest;
      const responseBody = await CreateAnamnesis(userEmail, requestBody);
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
      const responseBody = await UpdateAnamnesis(userEmail, requestBody);
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
      const anamnesisType = ctx.query.anamnesisType as string;
      const limit = ctx.query.limit as string;

      const responseBody = await GetAnamnesisListAsync(
        userId,
        pageNumber,
        customerId,
        startDate,
        endDate,
        anamnesisType,
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
