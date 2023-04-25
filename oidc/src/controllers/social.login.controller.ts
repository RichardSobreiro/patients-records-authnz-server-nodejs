/** @format */

import { Middleware } from "koa";
import {
  Provider,
  IssueRegistrationAccessTokenFunction,
  ResourceServer,
} from "oidc-provider";
import * as accountService from "../services/account-persist.service";

const gty = "authorization_code";

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
  _facebookLoginCallback: async (ctx) => {
    const facebookAccessToken: string = ctx.request.body.access_token;
    const app_id: string = ctx.request.body.app_id;
    const user_id: string = ctx.request.body.user_id;
    const username: string = ctx.request.body.username;
    const email: string = ctx.request.body.email;
    const pictureUrl: string = ctx.request.body.pictureUrl;

    // const accessTokenUrl: string = `https://graph.facebook.com/oauth/access_token?grant_type=client_credentials&client_id=${process.env.FACEBOOK_CLIENT_ID}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}`;
    // const responseAccessToken: Response = await fetch(accessTokenUrl);
    // const resultAccessToken =
    //   (await responseAccessToken.json()) as FacebookAccessTokenResponse;
    // const url: string = `https://graph.facebook.com/v16.0/debug_token?input_token=${facebookAccessToken}&access_token=${resultAccessToken.access_token}`;
    // const response: Response = await fetch(url);
    // const result = (await response.json()) as FacebookInstrospectionResponse;
    // if (
    //   !result.data.is_valid ||
    //   result.data.app_id !== app_id ||
    //   result.data.user_id !== user_id
    // ) {
    //   ctx.throw(400, "Invalid user credentials.");
    // }
    //ctx.body = "Success!";
    //const props = await oidc.interactionDetails(ctx.req, ctx.res);

    const account = await accountService.get(email);
    if (!account) {
      await accountService.set(email, {
        username: username,
        email: email,
        password: null,
        origin: {
          type: "Social-Login-Facebook",
          thirdPartyUserId: user_id,
        },
        picture: {
          socialLoginUrl: pictureUrl,
          cdn: null,
        },
      });
    }

    let responseBody: any;
    try {
      let client = await oidc.Client.find("app");
      let accountId: string | undefined = email;
      let grantId: string;

      let grant = new oidc.Grant({
        accountId,
        clientId: client?.clientId,
      });
      grant.addOIDCScope(
        "openid email profile phone address offline_access api:read"
      );
      grant.addOIDCClaims(["address", "email", "profile", "phone"]);
      grant.addResourceScope("default", "api:read offline_access");
      grantId = await grant.save();

      let scopes = grant!.getOIDCScope();
      let claims = grant.getOIDCClaims();

      // let newAuthCode = new oidc.AuthorizationCode({
      //   client: client!,
      //   accountId: accountId,
      //   scope: scopes,
      //   grantId: grantId,
      //   gty: gty,
      // });

      // let codeId = await newAuthCode.save();

      // let code = await oidc.AuthorizationCode.find(codeId);

      // await code!.consume();
      // const resourceServer = new oidc.ResourceServer("", {
      //   scope: "api:read offline_access",
      //   accessTokenTTL: 2 * 60 * 60, // 2 hours
      //   accessTokenFormat: "jwt",
      //   jwt: {
      //     sign: { alg: "ES256" },
      //   },
      // });
      ctx.oidc.getResourceServerInfo();
      const accessTokenProperties = {
        client: client!,
        accountId: email,
        //resourceServer: resourceServer,
        //claims: claims,
        //aud?: string | string[] | undefined;
        scope: scopes,
        // sid: code!.sid,
        // sessionUid: code!.sessionUid,
        // expiresWithSession: code!.expiresWithSession,
        //"x5t#S256"?: string | undefined;
        //jkt?: string | undefined;
        grantId: grantId,
        gty: gty,
      };
      const accessToken = new oidc.AccessToken(accessTokenProperties);
      //accessToken.resourceServer = resourceServer;
      console.log(accessToken);
      const accessTokenString = await accessToken.save();
      console.log(accessToken);
      // let test = await oidc.interactionFinished(ctx.req, ctx.res, resultLogin, {
      //   mergeWithLastSubmission: false,
      // });
      responseBody = {
        access_token: accessTokenString,
        // expires_in: at.expiration,
        // id_token: idToken,
        // refresh_token: refreshToken,
        // scope: at.scope,
        // token_type: at.tokenType,
      };
    } catch (err: any) {
      console.log(err);
    }

    ctx.body = responseBody;
  },
  get facebookLoginCallback() {
    return this._facebookLoginCallback;
  },
  set facebookLoginCallback(value) {
    this._facebookLoginCallback = value;
  },
});
