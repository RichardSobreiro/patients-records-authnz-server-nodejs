/** @format */

import { PaymentInfo } from "../../db/mongodb/models/PaymentInfo";
import {
  PAYMENT_INSTALMENT_STATUS,
  PaymentInstalments,
} from "../../db/mongodb/models/PaymentInstalments";
import { AditionalInfoRequest } from "../../models/AditionalInfoRequest";
import { PAYMENT_METHOD } from "../../models/payments/PaymentMethods";
import { PaymentProcessingResponse } from "../../models/payments/PaymentProcessingResponse";

export const createPaymentCreditCard = async (
  userEmail: string,
  userInfo: AditionalInfoRequest
): Promise<PaymentProcessingResponse> => {
  const paymentInfo = {
    username: userEmail,
    paymentTypeCode: PAYMENT_METHOD.CREDIT_CARD,
    description: "Credit Card Recurrent",
    creditCardEncrypted: userInfo.paymentInfo!.creditCardInfo?.encrypted,
    securityCode: userInfo.paymentInfo!.creditCardInfo?.securityCode,
    holderName: userInfo.paymentInfo!.creditCardInfo?.holderName,
    paymentOk: false,
  };
  const existingPaymentInfoDoc = await PaymentInfo.exists({
    username: userEmail,
  });
  let paymentInfoDoc: any;
  let paymentInstalment: any;
  if (existingPaymentInfoDoc) {
    paymentInfoDoc = await PaymentInfo.findOneAndUpdate(
      { _id: existingPaymentInfoDoc._id },
      paymentInfo
    );
    paymentInstalment = await PaymentInstalments.findOneAndUpdate(
      {
        username: userEmail,
        paymentInfoId: paymentInfoDoc._id,
      },
      {
        username: userEmail,
        paymentInfoId: paymentInfoDoc._id,
        creationDate: new Date(),
        instalmentNumber: 1,
        status: PAYMENT_INSTALMENT_STATUS.PENDING,
      }
    );
  } else {
    paymentInfoDoc = await PaymentInfo.create(paymentInfo);
    paymentInstalment = await PaymentInstalments.create({
      username: userEmail,
      paymentInfoId: paymentInfoDoc._id,
      creationDate: new Date(),
      instalmentNumber: 1,
      status: PAYMENT_INSTALMENT_STATUS.PENDING,
    });
  }

  const requestBody = {
    reference_id: paymentInstalment._id,
    description: `Instalment Number ${paymentInstalment.instalmentNumber}`,
    amount: {
      value: userInfo.userPlanId === "2" ? 1990 : 4000,
      currency: "BRL",
    },
    payment_method: {
      type: "CREDIT_CARD",
      installments: 1,
      capture: true,
      card: {
        encrypted: paymentInfo.creditCardEncrypted,
        security_code: paymentInfo.securityCode,
        holder: {
          name: paymentInfo.holderName,
        },
        store: true,
      },
    },
    recurring: {
      type: "INITIAL",
    },
    notification_urls: ["https://meusite.com/notificacoes"],
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
    await PaymentInstalments.findOneAndUpdate(
      { _id: paymentInstalment._id },
      {
        status: PAYMENT_INSTALMENT_STATUS.OK,
        paymentProcessorResponse: responseBody,
      }
    );

    const date = new Date();
    const paymentValidUntil = new Date(date.setDate(date.getDate() + 31));

    await PaymentInfo.findOneAndUpdate(
      { _id: paymentInfoDoc._id },
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
      { _id: paymentInfoDoc._id },
      { paymentOk: false }
    );

    const message =
      "Tivemos um erro no processamento do seu pagamento. Tente novamente!";
    return new PaymentProcessingResponse(false, message);
  }
};
