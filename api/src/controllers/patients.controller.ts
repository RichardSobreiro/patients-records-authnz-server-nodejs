/** @format */

import { Middleware } from "koa";
import {
  CreatePatient,
  GetPatients,
  GetPatientById,
} from "../services/patients";
import { CreatePatientRequest } from "../models/patients/CreatePatientRequest";

export default (): { [key: string]: Middleware } => ({
  pi: async (ctx) => {
    ctx.status = 200;
    ctx.message = Math.PI.toString();
  },
  createPatient: async (ctx) => {
    try {
      const requestBody = ctx.request.body as CreatePatientRequest;
      const responseBody = await CreatePatient(requestBody);
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
      const responseBody = await GetPatients(patientName);
      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
  getPatientById: async (ctx) => {
    try {
      const responseBody = await GetPatientById(ctx.params.patientId);
      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
    }
  },
});
