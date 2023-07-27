/** @format */

import { Middleware } from "koa";
import { CreateAnamnesisTypeRequest } from "../models/customers/anamnesis/anamnesis-types/CreateAnamnesisTypeRequest";
import {
  CreateAnamnesisType,
  GetAnamnesisTypeById,
  GetAnamnesisTypes,
  UpdateAnamnesisType,
} from "../services/anamnesis.types-service";
import { UpdateAnamnesisTypeRequest } from "../models/customers/anamnesis/anamnesis-types/UpdateAnamnesisTypeRequest";

export default (): { [key: string]: Middleware } => ({
  createAnamnesisType: async (ctx) => {
    try {
      const userId = ctx.state.session.sub as string;
      const requestBody = ctx.request.body as CreateAnamnesisTypeRequest;
      const responseBody = await CreateAnamnesisType(userId, requestBody);
      ctx.status = 201;
      ctx.message = "Created";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
  getAnamnesisTypeById: async (ctx) => {
    try {
      const userId = ctx.state.session.sub as string;
      const anamnesisTypeId = ctx.query.anamnesisTypeId as string;

      const responseBody = await GetAnamnesisTypeById(userId, anamnesisTypeId);

      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
  getAnamnesisTypeList: async (ctx) => {
    try {
      const userId = ctx.state.session.sub as string;
      const anamnesisTypeDescription = ctx.query
        .anamnesisTypeDescription as string;

      const responseBody = await GetAnamnesisTypes(
        userId,
        anamnesisTypeDescription
      );

      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
  updateAnamnesisType: async (ctx) => {
    try {
      const userId = ctx.state.session.sub as string;
      const requestBody = ctx.request.body as UpdateAnamnesisTypeRequest;

      const responseBody = await UpdateAnamnesisType(userId, requestBody);

      ctx.status = 200;
      ctx.message = "Ok";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
});
