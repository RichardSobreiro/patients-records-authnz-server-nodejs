/** @format */

import Router from "koa-router";
import { authenticate } from "../middlewares/auth.middleware";
import securityController from "../controllers/security.controller";

export default () => {
  const router = new Router();

  const { createOTP, updateOTP } = securityController();

  router.post("/security/otp", authenticate, createOTP);
  router.put("/security/otp", authenticate, updateOTP);

  return router;
};
