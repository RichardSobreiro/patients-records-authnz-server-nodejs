/** @format */

import cors from "@koa/cors";
import Koa from "koa";
import router from "./routes";
import * as dotenv from "dotenv";

dotenv.config();

const app = new Koa();

app.use(cors());
app.use(router().routes());

app.listen(process.env.PORT_API, () => {
  console.log(`api listening on port ${process.env.PORT_API}`);
});
