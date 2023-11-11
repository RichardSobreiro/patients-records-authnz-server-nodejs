/** @format */

import { AccountRepository } from "../db/models/AccountRepository";
import GetAccountSettingsResponse from "../models/settings/accounts/GetAccountSettingsResponse";
import UpdateAccountSettingsRequest from "../models/settings/accounts/UpdateAccountSettingsRequest";
import UpdateAccountSettingsResponse from "../models/settings/accounts/UpdateAccountSettingsResponse";

export const getAccountSettings = async (
  userId: string
): Promise<GetAccountSettingsResponse> => {
  const accountDocument = await AccountRepository.findOne({ userId: userId });

  if (accountDocument) {
    return new GetAccountSettingsResponse(
      accountDocument.userPlanId,
      accountDocument.userNameComplete,
      accountDocument.username,
      accountDocument.userBirthdate,
      accountDocument.gender,
      accountDocument.userCPF,
      accountDocument.userCreationCompleted,
      accountDocument.phoneNumber,
      accountDocument.phoneNumberVerified,
      accountDocument.email,
      accountDocument.emailVerified,
      accountDocument.userAddressCEP,
      accountDocument.userAddressStreet,
      accountDocument.userAddressNumber,
      accountDocument.userAddressDistrict,
      accountDocument.userAddressCity,
      accountDocument.userAddressComplement,
      accountDocument.userAddressState,
      accountDocument.companyName,
      accountDocument.companyCNPJ,
      accountDocument.companyNumberOfEmployees
    );
  } else {
    throw new Error("404");
  }
};

export const updateAccountSettings = async (
  userId: string,
  request: UpdateAccountSettingsRequest
): Promise<UpdateAccountSettingsResponse> => {
  let userCreationCompleted = true;

  for (const [key, value] of Object.entries(request)) {
    if (
      key !== "companyName" &&
      key !== "companyNumberOfEmployees" &&
      key !== "companyCNPJ" &&
      (value === undefined || value === null || value === "")
    ) {
      userCreationCompleted = false;
    }
  }
  const beforeUpdateDoc = await AccountRepository.findOneAndUpdate(
    { userId: userId },
    {
      userPlanId: request.userPlanId,
      userNameComplete: request.userNameComplete,
      username: request.username,
      userBirthdate: request.userBirthdate,
      gender: request.userGender,
      userCPF: request.userCPF,
      phoneNumber: request.phoneNumber,
      email: request.email,
      userAddressCEP: request.userAddressCEP,
      userAddressStreet: request.userAddressStreet,
      userAddressNumber: request.userAddressNumber,
      userAddressDistrict: request.userAddressDistrict,
      userAddressCity: request.userAddressCity,
      userAddressComplement: request.userAddressComplement,
      userAddressState: request.userAddressState,
      companyName: request.companyName,
      companyCNPJ: request.companyCNPJ,
      companyNumberOfEmployees: request.companyNumberOfEmployees,
      userCreationCompleted: false,
    }
  );

  return new UpdateAccountSettingsResponse(
    request.userPlanId,
    request.userNameComplete,
    request.username,
    request.userBirthdate,
    request.userGender,
    request.userCPF,
    false,
    request.phoneNumber,
    beforeUpdateDoc.phoneNumberVerified,
    request.email,
    beforeUpdateDoc.emailVerified,
    request.userAddressCEP,
    request.userAddressStreet,
    request.userAddressNumber,
    request.userAddressDistrict,
    request.userAddressCity,
    request.userAddressComplement,
    request.userAddressState,
    request.companyName,
    request.companyCNPJ,
    request.companyNumberOfEmployees
  );
};
