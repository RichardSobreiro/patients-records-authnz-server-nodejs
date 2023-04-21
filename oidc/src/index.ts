/** @format */

import Koa from "koa";
import render from "koa-ejs";
import mount from "koa-mount";
import koaStatic from "koa-static";
import path from "path";
import { configuration } from "./configs/configuration";
import { oidc } from "./configs/provider";
import connectMongodb from "./db/mongodb/connection";
import router from "./routes";
import * as dotenv from "dotenv";

dotenv.config();

const start = async () => {
  await connectMongodb();

  const app = new Koa();
  render(app, {
    cache: false,
    viewExt: "ejs",
    layout: false,
    root: path.resolve("oidc/src/views"),
  });

  const provider = oidc(process.env.OIDC_ISSUER as string, configuration);

  function handleClientAuthErrors(
    { headers: { authorization }, oidc: { body, client } },
    err
  ) {
    if (err.statusCode === 401 && err.message === "invalid_client") {
      // console.log(err);
      // save error details out-of-bands for the client developers, `authorization`, `body`, `client`
      // are just some details available, you can dig in ctx object for more.
    }
  }
  provider.on("server_error", handleClientAuthErrors);
  provider.on("grant.error", handleClientAuthErrors);
  provider.on("introspection.error", handleClientAuthErrors);
  provider.on("revocation.error", handleClientAuthErrors);

  app.use(koaStatic(path.resolve("public")));
  app.use(router(provider).routes());
  app.use(mount(provider.app));

  app.listen(process.env.PORT, () => {
    console.log(`oidc-provider listening on port ${process.env.PORT}`);
  });
};

void start();
