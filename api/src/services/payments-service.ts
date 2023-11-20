/** @format */

import { AccountRepository } from "../db/models/AccountRepository";
import { PaymentsUserMethodRepository } from "../db/models/PaymentsUserMethodRepository";
import { PaymentInstalmentsRepository } from "../db/models/PaymentInstalmentsRepository";
import PaymentInstalmentsStatus from "../enums/PaymentInstalmentsStatus";
import PaymentMethods from "../enums/PaymentMethods";
import PaymentsUserMethodStatus from "../enums/PaymentsUserMethodStatus";
import CreatePaymentRequest from "../models/settings/payments/CreatePaymentRequest";
import CreatePaymentResponse from "../models/settings/payments/CreatePaymentResponse";
import { v4 as uuidv4 } from "uuid";
import CreateUserPaymentMethodRequest from "../models/settings/payments/CreatePaymentMethodRequest";
import CreateUserPaymentMethodResponse, {
  CreateCreditCardPaymentMethodResponse,
} from "../models/settings/payments/CreatePaymentMethodResponse";
import { createCreditCardPayment } from "./pagbank/credit-card.service";

export const createUserPaymentMethod = async (
  userId: string,
  paymentRequest: CreateUserPaymentMethodRequest
): Promise<CreateUserPaymentMethodResponse> => {
  const accountDoc = await AccountRepository.findOne({ userId: userId });
  if (!accountDoc) {
    throw new Error("Account not found");
  }

  const paymentUserMethodDoc = await PaymentsUserMethodRepository.create({
    paymentsUserMethodId: uuidv4(),
    userId: userId,
    creationDate: new Date(),
    paymentMethodId: PaymentMethods.CreditCardRecurrent,
    status: PaymentsUserMethodStatus.PENDING,
    statusDescription: "Credit Card Recurrent",
    expireDate: undefined,
    creditCard: {
      numberEncrypted: paymentRequest.creditCard?.number,
      fourFinalNumbers: paymentRequest.creditCard?.fourFinalNumbers,
      cvc: paymentRequest.creditCard?.cvc,
      holderName: paymentRequest.creditCard?.name,
      expiry: paymentRequest.creditCard?.expiry,
      brand: paymentRequest.creditCard?.type,
    },
  });

  return new CreateUserPaymentMethodResponse(
    paymentUserMethodDoc.paymentsUserMethodId,
    userId,
    paymentUserMethodDoc.creationDate,
    paymentUserMethodDoc.paymentMethodId,
    paymentUserMethodDoc.status,
    paymentUserMethodDoc.statusDescription,
    paymentUserMethodDoc.expireDate,
    new CreateCreditCardPaymentMethodResponse(
      paymentUserMethodDoc.creditCard?.cvc!,
      paymentUserMethodDoc.creditCard?.holderName!,
      paymentUserMethodDoc.creditCard?.expireData!,
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
    paymentsUserMethodId: request.paymentsUserMethodId,
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
    paymentsUserMethodId: request.paymentsUserMethodId,
    userId: userId,
    creationDate: new Date(),
    expireDate: undefined,
    instalmentNumber:
      existingInstalmentsDocs?.length > 0
        ? +existingInstalmentsDocs[0].instalmentNumber + 1
        : 1,
    status: PaymentInstalmentsStatus.PENDING,
  });

  const response = await createCreditCardPayment(
    paymentInstalmentDoc.paymentInstalmentsId,
    paymentInstalmentDoc.paymentUserMethodId,
    paymentUserMethodDoc.creditCard?.numberEncrypted!,
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
        paymentProcessorResponse: responseBody,
      }
    );

    await PaymentsUserMethodRepository.findOneAndUpdate(
      { paymentsUserMethodId: request.paymentsUserMethodId },
      {
        status: PaymentsUserMethodStatus.OK,
        statusDescription: statusDescriptionPayment,
        expireDate: paymentValidUntil,
      }
    );

    return new CreatePaymentResponse(
      paymentInstalmentDoc.paymentInstalmentsId,
      request.paymentsUserMethodId,
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
      { paymentsUserMethodId: request.paymentsUserMethodId },
      {
        status: PaymentsUserMethodStatus.ERROR,
        statusDescription: statusDescriptionPayment,
        expireDate: paymentValidUntil,
      }
    );

    return new CreatePaymentResponse(
      paymentInstalmentDoc.paymentInstalmentsId,
      request.paymentsUserMethodId,
      userId,
      paymentInstalmentDoc.creationDate,
      paymentInstalmentDoc.instalmentNumber,
      PaymentInstalmentsStatus.OK,
      statusDescriptionInstalments,
      paymentValidUntil
    );
  }
};
