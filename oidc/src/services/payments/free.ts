/** @format */

import { PaymentInfo } from "../../db/mongodb/models/PaymentInfo";
import { AditionalInfoRequest } from "../../models/AditionalInfoRequest";
import { PAYMENT_METHOD } from "../../models/payments/PaymentMethods";
import { PaymentProcessingResponse } from "../../models/payments/PaymentProcessingResponse";

export const createPaymentFree = async (
  userEmail: string,
  userInfo: AditionalInfoRequest
): Promise<PaymentProcessingResponse> => {
  const paymentInfo = {
    username: userEmail,
    paymentTypeCode: PAYMENT_METHOD.FREE,
    description: "Free",
  };
  const existingPaymentInfoDoc = await PaymentInfo.exists({
    username: userEmail,
  });
  let paymentInfoDoc: any;
  if (existingPaymentInfoDoc) {
    paymentInfoDoc = await PaymentInfo.findOneAndUpdate(
      { _id: existingPaymentInfoDoc._id },
      paymentInfo
    );
  } else {
    paymentInfoDoc = await PaymentInfo.create(paymentInfo);
  }
  const paymentOk: boolean = true;
  const message = "Tudo certo com seu pagamento!";
  return new PaymentProcessingResponse(paymentOk, message);
};
