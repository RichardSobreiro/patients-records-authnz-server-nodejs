/** @format */

import Router from "koa-router";
import { Provider } from "oidc-provider";
import authRouter from "../routes/auth.router";
import socialLoginRouter from "../routes/social.login.router";

export default (oidc: Provider) => {
  const router = new Router();

  router.use(authRouter(oidc).routes());
  router.use(socialLoginRouter(oidc).routes());

  return router;
};
