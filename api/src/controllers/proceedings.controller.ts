/** @format */
import { Middleware, Request } from "koa";
import { CreateProceedingRequest } from "../models/patients/proceedings/CreateProceedingRequest";
import { createProceeding } from "../services/create.proceedings";
import {
  getProceedingById,
  getProceedings,
  getProceedingsTypesByEmail,
} from "../services/get.proceedings";
import { UpdateProceedingRequest } from "../models/patients/proceedings/UpdateProceedingRequest";
import { updateProceeding } from "../services/update.proceedings";

interface MulterRequest extends Request {
  files: any;
}

export default (): { [key: string]: Middleware } => ({
  createProceeding: async (ctx) => {
    try {
      const files = (ctx.request as MulterRequest).files;
      const requestBody = ctx.request.body as CreateProceedingRequest;
      const patientId = ctx.params.patientId;
      const userId = ctx.state.session.sub as string;

      const responseBody = await createProceeding(
        userId,
        patientId,
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
  updateProceeding: async (ctx) => {
    try {
      const files = (ctx.request as MulterRequest).files;
      const requestBody = ctx.request.body as UpdateProceedingRequest;
      const patientId = ctx.params.patientId;
      const proceedingId = ctx.params.proceedingId;
      const userId = ctx.state.session.sub as string;

      const responseBody = await updateProceeding(
        userId,
        patientId,
        proceedingId,
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
  getProceedingById: async (ctx) => {
    try {
      const patientId = ctx.params.patientId;
      const proceedingId = ctx.params.proceedingId;

      const responseBody = await getProceedingById(patientId, proceedingId);

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
      const patientId = ctx.params.patientId;
      const pageNumber = ctx.query.pageNumber as string;
      const limit = ctx.query.limit as string;

      const responseBody = await getProceedings(patientId, pageNumber, limit);

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
  getProceedingsTypesByEmail: async (ctx) => {
    try {
      const email = ctx.params.email;

      const responseBody = await getProceedingsTypesByEmail(email);

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
