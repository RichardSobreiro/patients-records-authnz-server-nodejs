/** @format */

import { Account, AccountRepository } from "../db/models/AccountRepository";
import { PaymentsUserMethodRepository } from "../db/models/PaymentsUserMethodRepository";
import { PaymentInstalmentsRepository } from "../db/models/PaymentInstalmentsRepository";
import PaymentInstalmentsStatus from "../constants/PaymentInstalmentsStatus";
import PaymentMethods from "../constants/PaymentMethods";
import PaymentsUserMethodStatus from "../constants/PaymentsUserMethodStatus";
import CreatePaymentRequest from "../models/settings/payments/CreatePaymentRequest";
import CreatePaymentResponse from "../models/settings/payments/CreatePaymentResponse";
import { v4 as uuidv4 } from "uuid";
import CreateUserPaymentMethodRequest from "../models/settings/payments/CreatePaymentMethodRequest";
import CreateUserPaymentMethodResponse, {
  CreateCreditCardPaymentMethodResponse,
} from "../models/settings/payments/CreatePaymentMethodResponse";
import { createCreditCardPayment } from "./pagbank/credit-card.service";
import GetPaymentInstalmentResponse from "../models/settings/payments/GetPaymentInstalmentResponse";
import {
  GetCreditCardUserPaymentMethodResponse,
  GetUserPaymentMethodResponse,
} from "../models/settings/payments/GetPaymentUserMethodResponse";
import Plans from "../constants/Plans";
import PaymentStatus from "../constants/PaymentStatus";

export const createUserPaymentMethod = async (
  userId: string,
  paymentRequest: CreateUserPaymentMethodRequest
): Promise<CreateUserPaymentMethodResponse> => {
  const accountDoc = await AccountRepository.findOne({ userId: userId });
  if (!accountDoc) {
    throw new Error("Account not found");
  }

  const existingPaymentMethod = await PaymentsUserMethodRepository.findOne({
    userId: userId,
    paymentMethodId: PaymentMethods.CreditCardRecurrent,
    "creditCard.fourFinalNumbers": paymentRequest.creditCard?.fourFinalNumbers,
    "creditCard.cvc": paymentRequest.creditCard?.cvc,
    "creditCard.holderName": paymentRequest.creditCard?.name,
    "creditCard.expiry": paymentRequest.creditCard?.expiry,
    "creditCard.brand": paymentRequest.creditCard?.type,
  });
  if (existingPaymentMethod) {
    return new CreateUserPaymentMethodResponse(
      existingPaymentMethod.paymentUserMethodId,
      userId,
      existingPaymentMethod.creationDate,
      existingPaymentMethod.paymentMethodId,
      existingPaymentMethod.isDefault,
      existingPaymentMethod.status,
      existingPaymentMethod.statusDescription,
      existingPaymentMethod.expireDate,
      new CreateCreditCardPaymentMethodResponse(
        existingPaymentMethod.creditCard?.cvc!,
        existingPaymentMethod.creditCard?.holderName!,
        existingPaymentMethod.creditCard?.expiry!,
        existingPaymentMethod.creditCard?.fourFinalNumbers!,
        existingPaymentMethod.creditCard?.brand!
      )
    );
  }

  const paymentUserMethodDoc = await PaymentsUserMethodRepository.create({
    paymentUserMethodId: uuidv4(),
    userId: userId,
    creationDate: new Date(),
    paymentMethodId: PaymentMethods.CreditCardRecurrent,
    isDefault: paymentRequest.isDefault,
    status: PaymentsUserMethodStatus.PENDING,
    statusDescription: "Credit Card Recurrent",
    expireDate: undefined,
    creditCard: {
      encryptedCard: paymentRequest.creditCard?.encryptedCard,
      fourFinalNumbers: paymentRequest.creditCard?.fourFinalNumbers,
      cvc: paymentRequest.creditCard?.cvc,
      holderName: paymentRequest.creditCard?.name,
      expiry: paymentRequest.creditCard?.expiry,
      brand: paymentRequest.creditCard?.type,
    },
  });

  return new CreateUserPaymentMethodResponse(
    paymentUserMethodDoc.paymentUserMethodId,
    userId,
    paymentUserMethodDoc.creationDate,
    paymentUserMethodDoc.paymentMethodId,
    paymentUserMethodDoc.isDefault,
    paymentUserMethodDoc.status,
    paymentUserMethodDoc.statusDescription,
    paymentUserMethodDoc.expireDate,
    new CreateCreditCardPaymentMethodResponse(
      paymentUserMethodDoc.creditCard?.cvc!,
      paymentUserMethodDoc.creditCard?.holderName!,
      paymentUserMethodDoc.creditCard?.expiry!,
      paymentUserMethodDoc.creditCard?.fourFinalNumbers!,
      paymentUserMethodDoc.creditCard?.brand!
    )
  );
};

export const createPayment = async (
  userId: string,
  request: CreatePaymentRequest
): Promise<CreatePaymentResponse> => {
  const accountDoc = await AccountRepository.findOne({ userId: userId });
  if (!accountDoc) {
    throw new Error("Account not found");
  }

  const paymentUserMethodDoc = await PaymentsUserMethodRepository.findOne({
    paymentUserMethodId: request.paymentUserMethodId,
  });
  if (!paymentUserMethodDoc) {
    throw new Error("Payment method not found");
  }

  const existingInstalmentsDocs = await PaymentInstalmentsRepository.find({
    userId: userId,
    $or: [
      {
        status: PaymentInstalmentsStatus.OK,
      },
      {
        status: PaymentInstalmentsStatus.PENDING,
      },
    ],
  }).sort({ creationDate: "desc" });

  if (
    existingInstalmentsDocs?.length > 0 &&
    (existingInstalmentsDocs[0]
      .status as unknown as PaymentInstalmentsStatus) ===
      PaymentInstalmentsStatus.PENDING
  ) {
    throw new Error(
      "Existe uma tentativa de pagamento pendente. Por favor aguarde!"
    );
  }

  const paymentInstalmentDoc = await PaymentInstalmentsRepository.create({
    paymentInstalmentsId: uuidv4(),
    paymentUserMethodId: request.paymentUserMethodId,
    userId: userId,
    creationDate: new Date(),
    expireDate: undefined,
    instalmentNumber:
      existingInstalmentsDocs?.length > 0
        ? +existingInstalmentsDocs[0].instalmentNumber + 1
        : 1,
    status: PaymentInstalmentsStatus.PENDING,
    statusDescription: "Instalment payment being processed...",
  });

  const response = await createCreditCardPayment(
    paymentInstalmentDoc.paymentInstalmentsId,
    paymentInstalmentDoc.paymentUserMethodId,
    paymentUserMethodDoc.creditCard?.encryptedCard!,
    paymentUserMethodDoc.creditCard?.cvc!,
    paymentUserMethodDoc.creditCard?.holderName!
  );

  const responseBody = await response.json();

  if (response.ok) {
    const statusDescriptionInstalments: string =
      "Tudo certo com a mensalidade!";
    const statusDescriptionPayment: string = "Tudo certo com o seu pagamento!";

    const now = new Date();
    const paymentValidUntil = new Date(now.setDate(now.getDate() + 31));

    await PaymentInstalmentsRepository.findOneAndUpdate(
      { paymentInstalmentsId: paymentInstalmentDoc.paymentInstalmentsId },
      {
        status: PaymentInstalmentsStatus.OK,
        statusDescription: statusDescriptionInstalments,
        expireDate: paymentValidUntil,
        paymentDate: new Date(),
        paymentProcessorResponse: responseBody,
      }
    );

    await PaymentsUserMethodRepository.findOneAndUpdate(
      { paymentUserMethodId: request.paymentUserMethodId },
      {
        status: PaymentsUserMethodStatus.OK,
        statusDescription: statusDescriptionPayment,
        expireDate: paymentValidUntil,
      }
    );

    return new CreatePaymentResponse(
      paymentInstalmentDoc.paymentInstalmentsId,
      request.paymentUserMethodId,
      userId,
      paymentInstalmentDoc.creationDate,
      paymentInstalmentDoc.instalmentNumber,
      PaymentInstalmentsStatus.OK,
      statusDescriptionInstalments,
      paymentValidUntil
    );
  } else {
    const statusDescriptionInstalments: string = `Ocorreu um erro ao lançar essa mensalidade na fatura do seu cartão final ${paymentUserMethodDoc.creditCard?.fourFinalNumbers}`;
    const statusDescriptionPayment: string = "Erro ao processar o pagamento!";

    const paymentValidUntil = undefined;

    await PaymentInstalmentsRepository.findOneAndUpdate(
      { paymentInstalmentsId: paymentInstalmentDoc.paymentInstalmentsId },
      {
        status: PaymentInstalmentsStatus.ERROR,
        statusDescription: statusDescriptionInstalments,
        expireDate: paymentValidUntil,
        paymentProcessorResponse: responseBody,
      }
    );

    await PaymentsUserMethodRepository.findOneAndUpdate(
      { paymentUserMethodId: request.paymentUserMethodId },
      {
        status: PaymentsUserMethodStatus.ERROR,
        statusDescription: statusDescriptionPayment,
        expireDate: paymentValidUntil,
      }
    );

    return new CreatePaymentResponse(
      paymentInstalmentDoc.paymentInstalmentsId,
      request.paymentUserMethodId,
      userId,
      paymentInstalmentDoc.creationDate,
      paymentInstalmentDoc.instalmentNumber,
      PaymentInstalmentsStatus.OK,
      statusDescriptionInstalments,
      paymentValidUntil
    );
  }
};

export const getPaymentInstalmentById = async (
  userId: string,
  paymentInstalmentId: string
): Promise<GetPaymentInstalmentResponse> => {
  const paymentInstalmentDoc = await PaymentInstalmentsRepository.findOne({
    userId: userId,
    paymentInstalmentsId: paymentInstalmentId,
  });

  const paymentInstalmentResponse = new GetPaymentInstalmentResponse(
    paymentInstalmentDoc?.paymentInstalmentsId!,
    paymentInstalmentDoc?.paymentUserMethodId!,
    userId,
    paymentInstalmentDoc?.creationDate!,
    paymentInstalmentDoc?.instalmentNumber!,
    paymentInstalmentDoc?.status!,
    paymentInstalmentDoc?.statusDescription!,
    paymentInstalmentDoc?.expireDate,
    paymentInstalmentDoc?.paymentDate
  );

  if (paymentInstalmentDoc?.paymentUserMethodId) {
    const paymentUserMethodDoc = await PaymentsUserMethodRepository.findOne({
      userId: userId,
      paymentUserMethodId: paymentInstalmentDoc.paymentUserMethodId,
    });
    paymentInstalmentResponse.paymentMethod = new GetUserPaymentMethodResponse(
      paymentUserMethodDoc?.paymentUserMethodId!,
      userId,
      paymentUserMethodDoc?.creationDate!,
      paymentUserMethodDoc?.paymentMethodId!,
      paymentUserMethodDoc?.isDefault!,
      paymentUserMethodDoc?.status!,
      paymentUserMethodDoc?.statusDescription!,
      paymentUserMethodDoc?.expireDate!,
      new GetCreditCardUserPaymentMethodResponse(
        paymentUserMethodDoc?.creditCard?.cvc!,
        paymentUserMethodDoc?.creditCard?.holderName!,
        paymentUserMethodDoc?.creditCard?.expiry!,
        paymentUserMethodDoc?.creditCard?.fourFinalNumbers!,
        paymentUserMethodDoc?.creditCard?.brand
      )
    );
  }

  return paymentInstalmentResponse;
};

export const processRecurrentPayments = async () => {
  const accountDocs = await AccountRepository.find({});

  for (const accountDoc of accountDocs) {
    switch (accountDoc.userPlanId) {
      case Plans.Testing:
        await processTestingPlanPayment(accountDoc);
        break;
      case Plans.Monthly:
        await processMonthlyPlanPayment(accountDoc);
        break;
      default:
        await processTestingPlanPayment(accountDoc);
        break;
    }
  }
};

const processTestingPlanPayment = async (accountDoc: Account) => {
  const now = new Date();

  if (!accountDoc.dateCreationCompleted || !accountDoc.userCreationCompleted) {
    await AccountRepository.updateOne(
      { userId: accountDoc.userId },
      {
        $set: {
          paymentStatus: PaymentStatus.REGISTERING.toString(),
          paymentStatusDescription: PaymentStatus.REGISTERING.value,
        },
      }
    );
    return;
  }

  now.setUTCHours(0, 0, 0, 0);

  const dateCreationCompletedWithoutTime = new Date(
    accountDoc.dateCreationCompleted
  );
  dateCreationCompletedWithoutTime.setUTCHours(0, 0, 0, 0);

  const endTestPeriod = new Date(
    new Date(dateCreationCompletedWithoutTime).setDate(
      dateCreationCompletedWithoutTime.getDate() + 7
    )
  );

  if (endTestPeriod.getTime() < now.getTime()) {
    await AccountRepository.updateOne(
      { userId: accountDoc.userId },
      {
        $set: {
          paymentStatus: PaymentStatus.TESTINGENDED.toString(),
          paymentStatusDescription: PaymentStatus.TESTINGENDED.value,
        },
      }
    );
  }
};

const processMonthlyPlanPayment = async (accountDoc: Account) => {
  const now = new Date();

  if (!accountDoc.dateCreationCompleted || !accountDoc.userCreationCompleted) {
    await AccountRepository.updateOne(
      { userId: accountDoc.userId },
      {
        $set: {
          paymentStatus: PaymentStatus.REGISTERING.toString(),
          paymentStatusDescription: PaymentStatus.REGISTERING.value,
        },
      }
    );
    return;
  }

  now.setUTCHours(0, 0, 0, 0);

  const instalmentDocs = await PaymentInstalmentsRepository.find({
    userId: accountDoc.userId,
    status: PaymentInstalmentsStatus.OK,
  }).sort({ paymentDate: "desc", creationDate: "desc" });

  if (instalmentDocs?.length > 0 && instalmentDocs[0].expireDate) {
    if (typeof instalmentDocs[0].expireDate === "string") {
      instalmentDocs[0].expireDate = new Date(instalmentDocs[0].expireDate);
    }

    const expireDateUTCHours = new Date(instalmentDocs[0].expireDate);
    expireDateUTCHours.setUTCHours(0, 0, 0, 0);

    if (expireDateUTCHours.getTime() < now.getTime()) {
      await AccountRepository.updateOne(
        { userId: accountDoc.userId },
        {
          $set: {
            paymentStatus: PaymentStatus.NOTOK.toString(),
            paymentStatusDescription: PaymentStatus.NOTOK.value,
          },
        }
      );
      return;
    } else {
      await AccountRepository.updateOne(
        { userId: accountDoc.userId },
        {
          $set: {
            paymentStatus: PaymentStatus.OK.toString(),
            paymentStatusDescription: PaymentStatus.OK.value as string,
          },
        }
      );
      return;
    }
  }
};
