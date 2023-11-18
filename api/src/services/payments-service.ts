/** @format */

import { AccountRepository } from "../db/models/AccountRepository";
import { PaymentsRepository } from "../db/models/PaymentInfo";
import { PaymentInstalmentsRepository } from "../db/models/PaymentInstalments";
import PaymentInstalmentsStatus from "../enums/PaymentInstalmentsStatus";
import PaymentMethods from "../enums/PaymentMethods";
import PaymentStatus from "../enums/PaymentStatus";
import Plans from "../enums/Plans";
import PaymentRequest from "../models/settings/payments-plans/PaymentRequest";
import PaymentResponse from "../models/settings/payments-plans/PaymentResponse";
import { v4 as uuidv4 } from "uuid";

const createPaymentCreditCard = async (
  userId: string,
  paymentRequest: PaymentRequest
): Promise<PaymentResponse> => {
  const accountDoc = await AccountRepository.findOne({ userId: userId });
  if (!accountDoc) {
    throw new Error("Account not found");
  }

  const existingPaymentDoc = await PaymentsRepository.find({
    $or: [
      {
        userId: userId,
        expireDate: { $gte: new Date() },
        paymentStatus: PaymentStatus.OK,
      },
      {
        userId: userId,
        expireDate: { $gte: new Date() },
        paymentStatus: PaymentStatus.PENDING,
      },
    ],
  });

  if (existingPaymentDoc && existingPaymentDoc.length > 0) {
    throw new Error("Payment already created");
  }

  const paymentDoc = await PaymentsRepository.create({
    paymentId: uuidv4(),
    userId: userId,
    creationDate: new Date(),
    paymentMethodId: PaymentMethods.CreditCardRecurrent,
    description: "Credit Card Recurrent",
    paymentStatus: PaymentStatus.PENDING,
    expireDate: undefined,
    creditCard: {
      numberEncrypted: paymentRequest.creditCard?.number,
      cvc: paymentRequest.creditCard?.cvc,
      holderName: paymentRequest.creditCard?.name,
      expiry: paymentRequest.creditCard?.expiry,
      brand: paymentRequest.creditCard?.type,
    },
  });

  const paymentInstalment = await PaymentInstalmentsRepository.create({
    paymentInstalmentsId: uuidv4(),
    paymentId: paymentDoc.paymentId,
    userId: userId,
    creationDate: new Date(),
    expireDate: undefined,
    instalmentNumber: 1,
    status: PaymentInstalmentsStatus.PENDING,
  });

  const requestBody = {
    reference_id: paymentInstalment._id,
    description: `Instalment Number ${paymentInstalment.instalmentNumber}`,
    amount: {
      value: 1990,
      currency: "BRL",
    },
    payment_method: {
      type: "CREDIT_CARD",
      installments: 1,
      capture: true,
      card: {
        encrypted: paymentRequest.creditCard?.number,
        security_code: paymentRequest.creditCard?.cvc,
        holder: {
          name: paymentRequest.creditCard?.name,
        },
        store: true,
      },
    },
    recurring: {
      type: "INITIAL",
    },
    notification_urls: ["https://ap.portal-atender.com/payments/webhook"],
  };

  const response = await fetch(`${process.env.PAG_BANK_ORDERS_API_URL}`, {
    method: "POST",
    headers: {
      ["Content-Type"]: "application/json",
      ["Authorization"]: `Bearer ${process.env.PAG_BANK_AUTH_TOKEN}`,
    },
    body: JSON.stringify(requestBody),
  });

  const responseBody = await response.json();

  if (response.ok) {
    await PaymentInstalmentsRepository.findOneAndUpdate(
      { paymentInstalmentsId: paymentInstalment.paymentInstalmentsId },
      {
        status: PaymentInstalmentsStatus.OK,
        paymentProcessorResponse: responseBody,
      }
    );

    const date = new Date();
    const paymentValidUntil = new Date(date.setDate(date.getDate() + 31));

    await PaymentInfo.findOneAndUpdate(
      { _id: paymentDoc._id },
      { paymentOk: true, paymentValidUntil: paymentValidUntil }
    );

    const message = "Tudo certo com o seu pagamento";
    return new PaymentProcessingResponse(true, message);
  } else {
    await PaymentInstalments.findOneAndUpdate(
      { _id: paymentInstalment._id },
      {
        status: PAYMENT_INSTALMENT_STATUS.ERROR,
        paymentProcessorResponse: responseBody,
      }
    );

    await PaymentInfo.findOneAndUpdate(
      { _id: paymentDoc._id },
      { paymentOk: false }
    );

    const message =
      "Tivemos um erro no processamento do seu pagamento. Tente novamente!";
    return new PaymentProcessingResponse(false, message);
  }
};
