/** @format */

import { Middleware } from "koa";
import { Provider } from "oidc-provider";
import * as accountService from "../services/account-persist.service";

function debug(obj: any) {
  return Object.entries(obj)
    .map(
      (ent: [string, any]) =>
        `<strong>${ent[0]}</strong>: ${JSON.stringify(ent[1])}`
    )
    .join("<br>");
}

type FacebookInstrospectionResponse = {
  data: {
    app_id: string;
    is_valid: boolean;
    user_id: string;
  };
};

type FacebookAccessTokenResponse = {
  access_token: string;
  token_type: string;
};

export default (oidc: Provider): { [key: string]: Middleware } => ({
  facebookLoginCallback: async (ctx) => {
    const facebookAccessToken: string = ctx.request.body.access_token;
    const app_id: string = ctx.request.body.app_id;
    const user_id: string = ctx.request.body.user_id;

    const accessTokenUrl: string = `https://graph.facebook.com/oauth/access_token?grant_type=client_credentials&client_id=${process.env.FACEBOOK_CLIENT_ID}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}`;
    const responseAccessToken: Response = await fetch(accessTokenUrl);
    const resultAccessToken =
      (await responseAccessToken.json()) as FacebookAccessTokenResponse;

    const url: string = `https://graph.facebook.com/v16.0/debug_token?input_token=${facebookAccessToken}&access_token=${resultAccessToken.access_token}`;
    const response: Response = await fetch(url);
    const result = (await response.json()) as FacebookInstrospectionResponse;

    if (
      !result.data.is_valid ||
      result.data.app_id !== app_id ||
      result.data.user_id !== user_id
    ) {
      ctx.throw(400, "Invalid user credentials.");
    }

    ctx.body = "Success!";
  },
});
