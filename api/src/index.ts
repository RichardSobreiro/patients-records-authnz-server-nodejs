/** @format */

import cors from "@koa/cors";
import Koa from "koa";
import router from "./routes";
import * as dotenv from "dotenv";
import connectMongodb from "./db/connection";
import bodyparser from "koa-bodyparser";

dotenv.config();

const start = async () => {
  await connectMongodb();

  const app = new Koa();

  app.use(
    cors({
      origin: "*",
    })
  );
  app.use(bodyparser());
  app.use(async (ctx, next) => {
    //ctx.set("Content-Type", "application/json; charset=utf-8");
    ctx.set("Access-Control-Allow-Origin", "*");
    ctx.set(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    ctx.set(
      "Access-Control-Allow-Methods",
      "POST, GET, PUT, PATCH, DELETE, OPTIONS"
    );
    await next();
  });
  app.use(router().routes());

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err: any) {
      err.status = err.statusCode || err.status || 500;
      console.log(
        `API ERROR: ${err.status} - ${err.message || err.statusText}`
      );
      throw err;
    }
  });

  app.listen(process.env.PORT_API, () => {
    console.log(`api listening on port ${process.env.PORT_API}`);
  });
};

void start();
