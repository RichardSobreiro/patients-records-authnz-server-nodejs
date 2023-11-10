/** @format */

import { Middleware } from "koa";
import {
  getAccountSettings,
  updateAccountSettings,
} from "../services/account-service";
import UpdateAccountSettingsRequest from "../models/settings/accounts/UpdateAccountSettingsRequest";

export default (): { [key: string]: Middleware } => ({
  getAccountSettingsById: async (ctx) => {
    try {
      const userId = ctx.state.session.sub as string;
      const responseBody = await getAccountSettings(userId);
      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
      if (e.message === "404") {
        ctx.status = 404;
        ctx.message = "Account not found";
      } else {
        ctx.status = 500;
        ctx.message = "Internal Server Error";
      }
    }
  },
  updateAccountSettings: async (ctx) => {
    try {
      const userId = ctx.state.session.sub as string;

      const requestBody = ctx.request.body as UpdateAccountSettingsRequest;

      const responseBody = await updateAccountSettings(userId, requestBody);
      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
      if (e.message === "404") {
        ctx.status = 404;
        ctx.message = "Account not found";
      } else {
        ctx.status = 500;
        ctx.message = "Internal Server Error";
      }
    }
  },
});
