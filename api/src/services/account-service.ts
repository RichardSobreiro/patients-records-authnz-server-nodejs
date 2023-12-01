/** @format */

import { AccountRepository } from "../db/models/AccountRepository";
import { PaymentInstalmentsRepository } from "../db/models/PaymentInstalmentsRepository";
import { PaymentsUserMethodRepository } from "../db/models/PaymentsUserMethodRepository";
import PaymentInstalmentsStatus from "../constants/PaymentInstalmentsStatus";
import Plans from "../constants/Plans";
import GetAccountSettingsResponse from "../models/settings/accounts/GetAccountSettingsResponse";
import UpdateAccountSettingsRequest from "../models/settings/accounts/UpdateAccountSettingsRequest";
import UpdateAccountSettingsResponse from "../models/settings/accounts/UpdateAccountSettingsResponse";
import GetPaymentInstalmentResponse from "../models/settings/payments/GetPaymentInstalmentResponse";
import GetPaymentUserMethodResponse, {
  GetCreditCardUserPaymentMethodResponse,
  GetUserPaymentMethodResponse,
} from "../models/settings/payments/GetPaymentUserMethodResponse";

export const getAccountSettings = async (
  userId: string
): Promise<GetAccountSettingsResponse> => {
  const accountDocument = await AccountRepository.findOne({ userId: userId });

  if (accountDocument) {
    const accountResponse = new GetAccountSettingsResponse(
      accountDocument.userPlanId ?? Plans.Testing,
      accountDocument.userNameComplete!,
      accountDocument.username,
      accountDocument.userBirthdate!,
      accountDocument.gender!,
      accountDocument.userCPF!,
      accountDocument.userCreationCompleted,
      accountDocument.phoneNumber!,
      accountDocument.phoneNumberVerified!,
      accountDocument.email,
      accountDocument.emailVerified!,
      accountDocument.referPronoun!,
      accountDocument.messageProfessionalName!,
      accountDocument.userAddressCEP!,
      accountDocument.userAddressStreet!,
      accountDocument.userAddressNumber!,
      accountDocument.userAddressDistrict!,
      accountDocument.userAddressCity!,
      accountDocument.userAddressComplement!,
      accountDocument.userAddressState!,
      PaymentInstalmentsStatus.PENDING,
      undefined,
      undefined,
      accountDocument.companyName,
      accountDocument.companyCNPJ,
      accountDocument.companyNumberOfEmployees
    );

    const paymentInstalmentsDocs = await PaymentInstalmentsRepository.find({
      userId: userId,
    }).sort({
      instalmentNumber: "desc",
    });

    const lastPaidInstalment = paymentInstalmentsDocs
      .find((paid) => paid.status === PaymentInstalmentsStatus.OK)
      ?.toObject();
    const now = new Date();
    if (
      lastPaidInstalment &&
      lastPaidInstalment.expireDate!.getTime() >= now.getTime()
    ) {
      accountResponse.paymentStatus = PaymentInstalmentsStatus.OK;
    } else if (
      lastPaidInstalment &&
      lastPaidInstalment.expireDate!.getTime() < now.getTime() &&
      paymentInstalmentsDocs?.length > 0 &&
      paymentInstalmentsDocs[0].status !== PaymentInstalmentsStatus.ERROR
    ) {
      accountResponse.paymentStatus = PaymentInstalmentsStatus.PENDING;
    } else if (paymentInstalmentsDocs?.length > 0) {
      accountResponse.paymentStatus = paymentInstalmentsDocs[0].status;
    } else {
      accountResponse.paymentStatus = PaymentInstalmentsStatus.PENDING;
    }

    if (paymentInstalmentsDocs?.length > 0) {
      accountResponse.instalments = paymentInstalmentsDocs.map(
        (pi) =>
          new GetPaymentInstalmentResponse(
            pi.paymentInstalmentsId,
            pi.paymentUserMethodId,
            pi.userId,
            pi.creationDate,
            pi.instalmentNumber,
            pi.status,
            pi.statusDescription,
            pi.expireDate
          )
      );
    }

    const paymentUserMethodResponse = new GetPaymentUserMethodResponse();

    const userPaymentMethodsDocs = await PaymentsUserMethodRepository.find({
      userId: userId,
    }).sort({ creationDate: "desc" });

    if (userPaymentMethodsDocs?.length > 0) {
      const defaultUserPaymentMethodDoc = userPaymentMethodsDocs.find(
        (pm) => pm.isDefault === true
      );
      paymentUserMethodResponse.defaultPaymentMethod =
        defaultUserPaymentMethodDoc?.paymentMethodId;
      paymentUserMethodResponse.defaultPaymentUserMethodId =
        defaultUserPaymentMethodDoc?.paymentUserMethodId;
      paymentUserMethodResponse.paymentMethods = userPaymentMethodsDocs.map(
        (pmd) =>
          new GetUserPaymentMethodResponse(
            pmd.paymentUserMethodId,
            userId,
            pmd.creationDate,
            pmd.paymentMethodId,
            pmd.isDefault,
            pmd.status,
            pmd.statusDescription,
            pmd.expireDate,
            new GetCreditCardUserPaymentMethodResponse(
              pmd.creditCard?.cvc!,
              pmd.creditCard?.holderName!,
              pmd.creditCard?.expiry!,
              pmd.creditCard?.fourFinalNumbers!,
              pmd.creditCard?.brand
            )
          )
      );
      accountResponse.paymentUserMethods = paymentUserMethodResponse;
    }

    return accountResponse;
  } else {
    throw new Error("404");
  }
};

export const updateAccountSettings = async (
  userId: string,
  request: UpdateAccountSettingsRequest
): Promise<UpdateAccountSettingsResponse> => {
  const userCreationIsCompleted = isUserCreationCompleted(request);
  let dateUserCreationIsCompleted: Date | undefined = undefined;
  if (userCreationIsCompleted) {
    dateUserCreationIsCompleted = new Date();
  } else {
    dateUserCreationIsCompleted = undefined;
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
      referPronoun: request.referPronoun,
      messageProfessionalName: request.messageProfessionalName,
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
      userCreationCompleted: userCreationIsCompleted,
      dateCreationCompleted: dateUserCreationIsCompleted,
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
    beforeUpdateDoc?.phoneNumberVerified as unknown as boolean,
    request.email,
    beforeUpdateDoc?.emailVerified as unknown as boolean,
    request.referPronoun,
    request.messageProfessionalName,
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

const isUserCreationCompleted = (
  account: UpdateAccountSettingsRequest
): boolean => {
  if (
    account.userPlanId !== undefined &&
    account.userNameComplete !== undefined &&
    account.username !== undefined &&
    account.userBirthdate !== undefined &&
    account.userGender !== undefined &&
    account.userCPF !== undefined &&
    account.userCreationCompleted !== undefined &&
    account.phoneNumber !== undefined &&
    account.email !== undefined &&
    account.referPronoun !== undefined &&
    account.messageProfessionalName !== undefined &&
    account.userAddressCEP !== undefined &&
    account.userAddressStreet !== undefined &&
    account.userAddressNumber !== undefined &&
    account.userAddressDistrict !== undefined &&
    account.userAddressCity !== undefined &&
    account.userAddressComplement !== undefined &&
    account.userAddressState !== undefined
  ) {
    return true;
  } else {
    return false;
  }
};
