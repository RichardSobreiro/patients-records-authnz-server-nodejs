/** @format */

import Router from "koa-router";
import notificationsController from "../controllers/notifications.controller";
import { authenticate } from "../middlewares/auth.middleware";

export default () => {
  const router = new Router();

  const { getUserNotifications } = notificationsController();

  router.get("/notifications", authenticate, getUserNotifications);

  return router;
};
