/** @format */

import Router from "koa-router";
import appRouter from "./api.router";
import settingsRouter from "./settings.router";
import paymentsRouter from "./payments.router";

export default () => {
  const router = new Router();

  router.use(appRouter().routes());
  router.use(settingsRouter().routes());
  router.use(paymentsRouter().routes());

  return router;
};
