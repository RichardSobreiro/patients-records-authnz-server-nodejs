/** @format */

import { Middleware } from "koa";
import {
  getUserNotifications,
  updateUserNotification,
} from "../services/notifications-service";
import UpdateNotificationRequest from "../models/notifications/UpdateNotificationRequest";

export default (): { [key: string]: Middleware } => ({
  getUserNotifications: async (ctx) => {
    try {
      const userId = ctx.state.session.sub as string;
      const pageNumber = ctx.query.pageNumber as string;
      const limit = ctx.query.limit as string;

      const responseBody = await getUserNotifications(
        userId,
        pageNumber,
        limit
      );

      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
      ctx.status = 500;
      ctx.message = `${e.message || "Internal Server Error"}`;
    }
  },
  updateUserNotification: async (ctx) => {
    try {
      const userId = ctx.state.session.sub as string;
      const requestBody = ctx.request.body as UpdateNotificationRequest;

      const responseBody = await updateUserNotification(userId, requestBody);

      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
      ctx.status = 500;
      ctx.message = `${e.message || "Internal Server Error"}`;
    }
  },
});
