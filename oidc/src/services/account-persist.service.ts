/** @format */

import { Account } from "../db/mongodb/models/Account";
import { AditionalInfoRequest } from "../models/AditionalInfoRequest";
import { AditionalInfoResponse } from "../models/AditionalInfoResponse";
import { PAYMENT_METHOD } from "../models/payments/PaymentMethods";
import { PaymentProcessingResponse } from "../models/payments/PaymentProcessingResponse";
//import { createPaymentBankSlip } from "./payments/bank-slip";
import { createPaymentCreditCard } from "./payments/credit-card";
import { createPaymentFree } from "./payments/free";

export const get = async (key: string) => await Account.findOne({ email: key });
export const getByUsername = async (username: string) =>
  await Account.findOne({ username: username });
export const set = async (key: string, value: any) =>
  await Account.insertMany(value);

export const updateUserSettings = async (
  userEmail: string,
  request: AditionalInfoRequest
): Promise<AditionalInfoResponse> => {
  const userSettings = {
    userPlanId: request.userPlanId,
    companyName: request.companyName,
    companyCNPJ: request.companyCNPJ,
    companyNumberOfEmployees: request.companyNumberOfEmployees,
    userNameComplete: request.userNameComplete,
    userCPF: request.userCPF,
    phoneAreaCode: request.phoneAreaCode,
    phoneNumber: request.phoneNumber,
    userAddressCEP: request.userAddressCEP,
    userAddressStreet: request.userAddressStreet,
    userAddressNumber: request.userAddressNumber,
    userAddressDistrict: request.userAddressDistrict,
    userAddressCity: request.userAddressCity,
    userAddressComplement: request.userAddressComplement,
    userAddressState: request.userAddressState,
    userCreationCompleted: true,
  };

  let paymentProcessingResponse: PaymentProcessingResponse;
  // if (request.paymentInfo?.paymentTypeCode == PAYMENT_METHOD.CREDIT_CARD) {
  //   paymentProcessingResponse = await createPaymentCreditCard(
  //     userEmail,
  //     request
  //   );
  // } else if (request.paymentInfo?.paymentTypeCode == PAYMENT_METHOD.BANK_SLIP) {
  //   paymentProcessingResponse = await createPaymentBankSlip(userEmail, request);
  // } else {
  //   paymentProcessingResponse = await createPaymentFree(userEmail, request);
  // }

  const response: AditionalInfoResponse = new AditionalInfoResponse(
    request.userPlanId,
    request.userNameComplete,
    request.userCPF,
    true,
    paymentProcessingResponse!,
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

  // if (paymentProcessingResponse.paymentStatus) {
  //   await Account.findOneAndUpdate({ userId: userEmail }, userSettings);
  // } else {
  //   response.userCreationCompleted = false;
  // }
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
    new PaymentProcessingResponse(true, ""),
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
