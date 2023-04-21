/** @format */

import { RequestHandler } from "express";

import { FacebookCallbackResponse } from "../models/facebook-callback-response";
import { FacebookCallbackRequest } from "../models/facebook-callback-request";

export const handleFacebookCallback: RequestHandler = (req, res, next) => {
  const bearerToken = (req.body as FacebookCallbackRequest).BearerToken;

  const facebookCallbackResponse = new FacebookCallbackResponse(
    "",
    "",
    "",
    bearerToken
  );

  res.status(201).json({
    message: `User ${facebookCallbackResponse.username} loged in`,
    facebookCallbackResponse: facebookCallbackResponse,
  });
};
