/** @format */

import Router from "koa-router";
import accountSettingsController from "../controllers/accounts-settings.controller";
import { authenticate } from "../middlewares/auth.middleware";

export default () => {
  const router = new Router();

  const { getAccountSettingsById, updateAccountSettings } =
    accountSettingsController();

  router.get("/settings/accounts", authenticate, getAccountSettingsById);
  router.put("/settings/accounts", authenticate, updateAccountSettings);

  return router;
};
