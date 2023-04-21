/** @format */

import koaBody from "koa-body";
import Router from "koa-router";
import { Provider } from "oidc-provider";
import socialLoginController from "../controllers/social.login.controller";
import { noCache } from "../middlewares/no-cache.middleware";

const bodyParser = koaBody();

export default (oidc: Provider) => {
  const router = new Router();

  const { facebookLoginCallback } = socialLoginController(oidc);

  router.post(
    "/social-login/facebook/callback",
    noCache,
    bodyParser,
    facebookLoginCallback
  );

  return router;
};
