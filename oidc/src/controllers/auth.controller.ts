/** @format */

import { Middleware } from "koa";
import { Provider } from "oidc-provider";
import * as accountService from "../services/account-persist.service";
import { CreateUserRequest } from "../models/CreateUserRequest";
import { AditionalInfoRequest } from "../models/AditionalInfoRequest";
import { v4 as uuidv4 } from "uuid";

function debug(obj: any) {
  return Object.entries(obj)
    .map(
      (ent: [string, any]) =>
        `<strong>${ent[0]}</strong>: ${JSON.stringify(ent[1])}`
    )
    .join("<br>");
}

export default (oidc: Provider): { [key: string]: Middleware } => ({
  login: async (ctx) => {
    const requestBody = ctx.request.body as {
      password: string;
      username: string;
    };
    const {
      prompt: { name },
    } = await oidc.interactionDetails(ctx.req, ctx.res);
    if (name === "login") {
      const account = await accountService.get(requestBody.username);
      let result: any;
      if (account?.password === requestBody.password) {
        result = {
          login: {
            accountId: requestBody.username,
          },
        };
      } else {
        result = {
          error: "access_denied",
          error_description: "Username or password is incorrect.",
        };
      }
      return oidc.interactionFinished(ctx.req, ctx.res, result, {
        mergeWithLastSubmission: false,
      });
    }
  },
  register: async (ctx) => {
    const body = ctx.request.body as CreateUserRequest;
    const existingAccount = await accountService.get(body.email);
    if (existingAccount) {
      ctx.message = "Um usuário com o mesmo e-mail já foi cadastrado!";
      ctx.status = 422;
      ctx.response.body = JSON.stringify({
        message: "Um usuário com o mesmo e-mail já foi cadastrado!",
        status: 422,
      });
    } else {
      const userId = uuidv4();
      await accountService.set(userId, {
        userId: userId,
        email: body.email,
        creationDate: new Date(),
        username: body.username,
        password: body.password,
        companyName: body.userCompanyName,
        userPlanId: body.userPlanId,
      });
      ctx.message = "Created";
      ctx.status = 201;
      ctx.response.body = JSON.stringify({
        email: body.email,
        username: body.username,
        userCreationCompleted: false,
        userPlanId: body.userPlanId || "1",
        paymentStatus: {
          paymentOk: false,
        },
        userCompanyName: body.userCompanyName,
      });
    }
  },
  confirmInteraction: async (ctx) => {
    const interactionDetails = await oidc.interactionDetails(ctx.req, ctx.res);
    const {
      prompt: { name, details },
      params,
      session: { accountId },
    } = interactionDetails as any;

    if (name === "consent") {
      const grant = interactionDetails.grantId
        ? await oidc.Grant.find(interactionDetails.grantId)
        : new oidc.Grant({
            accountId,
            clientId: params.client_id as string,
          });

      if (grant) {
        if (details.missingOIDCScope) {
          grant.addOIDCScope(details.missingOIDCScope.join(" "));
        }
        if (details.missingOIDCClaims) {
          grant.addOIDCClaims(details.missingOIDCClaims);
        }
        if (details.missingResourceScopes) {
          for (const [indicator, scopes] of Object.entries(
            details.missingResourceScopes
          )) {
            grant.addResourceScope(indicator, (scopes as any).join(" "));
          }
        }

        const grantId = await grant.save();

        const result = { consent: { grantId } };
        await oidc.interactionFinished(ctx.req, ctx.res, result, {
          mergeWithLastSubmission: true,
        });
      }
    } else {
      ctx.throw(400, "Interaction prompt type must be `consent`.");
    }
  },
  abortInteraction: async (ctx) => {
    const result = {
      error: "access_denied",
      error_description: "End-User aborted interaction",
    };
    await oidc.interactionFinished(ctx.req, ctx.res, result, {
      mergeWithLastSubmission: false,
    });
  },
  interaction: async (ctx) => {
    const { uid, prompt, params, session } = (await oidc.interactionDetails(
      ctx.req,
      ctx.res
    )) as any;

    if (prompt.name === "login") {
      return ctx.render("login", {
        uid,
        details: prompt.details,
        params,
        session: session ? debug(session) : undefined,
        title: "Sign-In",
        dbg: {
          params: debug(params),
          prompt: debug(prompt),
        },
      });
    } else if (prompt.name === "consent") {
      return ctx.render("consent", {
        uid,
        title: "Authorize",
        clientId: params.client_id,
        scope: params.scope.replace(/ /g, ", "),
        session: session ? debug(session) : undefined,
        dbg: {
          params: debug(params),
          prompt: debug(prompt),
        },
      });
    } else {
      ctx.throw(501, "Not implemented.");
    }
  },
  updateUserSettings: async (ctx) => {
    try {
      const requestBody = ctx.request.body as AditionalInfoRequest;
      const userId = ctx.state.session.sub as string;

      const responseBody = await accountService.updateUserSettings(
        userId,
        requestBody
      );

      if (responseBody.paymentProcessingInfo.paymentOk) {
        ctx.status = 200;
        ctx.message = "OK";
        ctx.response.body = JSON.stringify(responseBody);
      } else {
        ctx.status = 422;
        ctx.message = responseBody.paymentProcessingInfo.message;
        ctx.response.body = JSON.stringify(responseBody);
      }
    } catch (e: any) {
      console.log(e);
      ctx.status = 422;
      ctx.message = "Bad Request";
      ctx.response.body = { message: e.message, stackTrace: e.stack };
    }
  },
  getUserSettings: async (ctx) => {
    try {
      const userId = ctx.state.session.sub as string;

      const responseBody = await accountService.getUserSettings(userId);

      ctx.status = 200;
      ctx.message = "OK";
      ctx.response.body = JSON.stringify(responseBody);
    } catch (e: any) {
      console.log(e);
      ctx.status = 422;
      ctx.message = "Bad Request";
      ctx.response.body = { message: e.message, stackTrace: e.stack };
    }
  },
});
