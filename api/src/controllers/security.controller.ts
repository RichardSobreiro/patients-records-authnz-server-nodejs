/** @format */

import { Middleware } from "koa";
import { processWebhookNotification } from "../services/whatsapp-service";
import CreateOTPRequest from "../models/security/CreateOTPRequest";
import { createOTP, updateOTP } from "../services/security/otp-service";
import UpdateOTPRequest from "../models/security/UpdateOTPRequest";
import UpdateOTPResponse from "../models/security/UpdateOTPResponse";
import CreateOTPResponse from "../models/security/CreateOTPResponse";

export default (): { [key: string]: Middleware } => ({
  createOTP: async (ctx) => {
    try {
      const requestBody = ctx.request.body as CreateOTPRequest;
      const responseBody = await createOTP(requestBody);

      if (responseBody instanceof CreateOTPResponse) {
        ctx.status = 201;
        ctx.message = "Created";
      } else {
        ctx.status = responseBody.httpStatusCode;
        ctx.message = responseBody.message;
      }
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      ctx.status = 500;
      ctx.message = `Internal Server Error: ${e.message}`;
      ctx.response.body = JSON.stringify({
        message: `Internal Server Error: ${e.message}`,
        httpStatusCode: 500,
      });
    }
  },
  updateOTP: async (ctx) => {
    try {
      const requestBody = ctx.request.body as UpdateOTPRequest;
      const responseBody = await updateOTP(requestBody);

      if (responseBody instanceof UpdateOTPResponse) {
        ctx.status = 200;
        ctx.message = "OK";
      } else {
        ctx.status = responseBody.httpStatusCode;
        ctx.message = responseBody.message;
      }
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      ctx.status = 500;
      ctx.message = `Internal Server Error: ${e.message}`;
      ctx.response.body = JSON.stringify({
        message: `Internal Server Error: ${e.message}`,
        httpStatusCode: 500,
      });
    }
  },
});
