/** @format */

import { Middleware } from "koa";
import {
  CreatePatient,
  GetPatients,
  GetPatientById,
  UpdatePatient,
} from "../services/patients";
import { CreatePatientRequest } from "../models/patients/CreatePatientRequest";
import { UpdatePatientRequest } from "../models/patients/UpdatePatientRequest";

export default (): { [key: string]: Middleware } => ({
  pi: async (ctx) => {
    ctx.status = 200;
    ctx.message = Math.PI.toString();
  },
  createPatient: async (ctx) => {
    try {
      const requestBody = ctx.request.body as CreatePatientRequest;
      const responseBody = await CreatePatient(requestBody);
      ctx.status = 201;
      ctx.message = "Created";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
  updatePatient: async (ctx) => {
    try {
      const requestBody = ctx.request.body as UpdatePatientRequest;
      const responseBody = await UpdatePatient(requestBody);
      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
  getPatients: async (ctx) => {
    try {
      const patientName = ctx.query.patientName as string;
      const startDate = ctx.query.startDate as unknown as Date;
      const endDate = ctx.query.startDate as unknown as Date;
      const proceedingTypeId = ctx.query.startDate as string;
      const userId = ctx.state.session.sub as string;

      const responseBody = await GetPatients(
        userId,
        patientName,
        startDate,
        endDate,
        proceedingTypeId
      );

      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
  getPatientById: async (ctx) => {
    try {
      const userId = ctx.state.session.sub as string;
      const responseBody = await GetPatientById(userId, ctx.params.patientId);
      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
});
