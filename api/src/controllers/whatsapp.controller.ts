/** @format */

import { Middleware } from "koa";
import { processWebhookNotification } from "../services/whatsapp-service";

export default (): { [key: string]: Middleware } => ({
  whatsappVerify: async (ctx) => {
    try {
      const hubMode = ctx.query["hub.mode"];
      const hubChallenge = ctx.query["hub.challenge"];
      const hubVerify_token = ctx.query["hub.verify_token"];

      if (
        hubMode === "subscribe" &&
        hubVerify_token === process.env.WHATSAPP_VERIFY_TOKEN
      ) {
        ctx.status = 200;
        ctx.message = "OK";
        ctx.response.body = hubChallenge;
      } else {
        ctx.status = 401;
        ctx.message = "Access Denied";
        ctx.response.body = JSON.stringify({
          message: "Token does not match",
          errorCode: 401,
        });
      }
    } catch (e: any) {
      console.log(e);
    }
  },
  sendAppointmentReminderMessage: async (ctx) => {
    try {
      const requestBody = ctx.request.body;
      const userId = ctx.state.session.sub as string;

      ctx.status = 200;
      ctx.message = "OK";
    } catch (e: any) {
      console.log(e);
      ctx.status = 400;
      ctx.message = "Bad Request";
      ctx.response.body = { message: e.message, stackTrace: e.stack };
    }
  },
  webHookEventNotification: async (ctx) => {
    try {
      const requestBody = ctx.request.body as string;

      await processWebhookNotification(requestBody);

      ctx.status = 200;
      ctx.message = "OK";
    } catch (e: any) {
      console.log(e);
      ctx.status = 400;
      ctx.message = "Bad Request";
      ctx.response.body = { message: e.message, stackTrace: e.stack };
    }
  },
});
