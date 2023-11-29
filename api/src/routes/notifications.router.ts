/** @format */

import Router from "koa-router";
import notificationsController from "../controllers/notifications.controller";
import { authenticate } from "../middlewares/auth.middleware";

export default () => {
  const router = new Router();

  const { getUserNotifications, updateUserNotification } =
    notificationsController();

  router.get("/notifications", authenticate, getUserNotifications);
  router.put("/notifications", authenticate, updateUserNotification);

  return router;
};
