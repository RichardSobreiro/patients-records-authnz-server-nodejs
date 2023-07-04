/** @format */

import { Account } from "../db/mongodb/models/Account";
import { AditionalInfoRequest } from "../models/AditionalInfoRequest";
import { AditionalInfoResponse } from "../models/AditionalInfoResponse";

export const get = async (key: string) => await Account.findOne({ email: key });
export const getByUsername = async (username: string) =>
  await Account.findOne({ username: username });
export const set = async (key: string, value: any) =>
  await Account.insertMany(value);

export const updateUserSettings = async (
  userEmail: string,
  request: AditionalInfoRequest
): Promise<AditionalInfoResponse> => {
  const account = await Account.findOneAndUpdate(
    { userId: userEmail },
    {
      userPlanId: request.userPlanId,
      companyName: request.companyName,
      companyCNPJ: request.companyCNPJ,
      companyNumberOfEmployees: request.companyNumberOfEmployees,
      userNameComplete: request.userNameComplete,
      userCPF: request.userCPF,
      userAddressCEP: request.userAddressCEP,
      userAddressStreet: request.userAddressStreet,
      userAddressDistrict: request.userAddressDistrict,
      userAddressCity: request.userAddressCity,
      userAddressComplement: request.userAddressComplement,
      userAddressState: request.userAddressState,
      userCreationCompleted: true,
    }
  );

  const response: AditionalInfoResponse = new AditionalInfoResponse(
    request.userPlanId,
    request.userNameComplete,
    request.userCPF,
    true,
    true,
    "Tudo certo com o seu pagamento!",
    request.userAddressCEP,
    request.userAddressStreet,
    request.userAddressDistrict,
    request.userAddressCity,
    request.userAddressComplement,
    request.userAddressState,
    request.companyName,
    request.companyCNPJ,
    request.companyNumberOfEmployees
  );

  return response;
};

export const getUserSettings = async (
  userEmail: string
): Promise<AditionalInfoResponse> => {
  const account = await Account.findOne({ userId: userEmail });

  const response: AditionalInfoResponse = new AditionalInfoResponse(
    account.userPlanId,
    account.userNameComplete,
    account.userCPF,
    true,
    true,
    "Tudo certo com o seu pagamento!",
    account.userAddressCEP,
    account.userAddressStreet,
    account.userAddressDistrict,
    account.userAddressCity,
    account.userAddressComplement,
    account.userAddressState,
    account.companyName,
    account.companyCNPJ,
    account.companyNumberOfEmployees
  );

  return response;
};
