/** @format */

import { Provider, Configuration } from "oidc-provider";
import { gty, parameters, passwordHandler } from "../actions/grants/password";
import {
  gtyFacebook,
  parametersFacebook,
  facebookHandler,
} from "../actions/grants/facebook";

import {
  gtyGoogle,
  parametersGoogle,
  googleHandler,
} from "../actions/grants/google";

export const oidc = (issuer: string, configuration: Configuration) => {
  const provider = new Provider(issuer, configuration);
  provider.registerGrantType(gty, passwordHandler, parameters);
  provider.registerGrantType(gtyFacebook, facebookHandler, parametersFacebook);
  provider.registerGrantType(gtyGoogle, googleHandler, parametersGoogle);
  return provider;
};
