/** @format */

import { Middleware } from "koa";
import { processScheduledReminders } from "../services/reminders-service";

export default (): { [key: string]: Middleware } => ({
  sendReminders: async (ctx) => {
    try {
      await processScheduledReminders();

      ctx.status = 200;
      ctx.message = "OK";
    } catch (e: any) {
      console.log(e);
      ctx.status = 500;
      ctx.message = "Internal Server Error";
      ctx.response.body = { message: e.message, stackTrace: e.stack };
    }
  },
});
