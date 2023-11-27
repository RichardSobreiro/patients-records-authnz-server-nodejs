/** @format */

import PaymentMethods from "../../../constants/PaymentMethods";
import PaymentsUserMethodStatus from "../../../constants/PaymentsUserMethodStatus";

export class GetCreditCardUserPaymentMethodResponse {
  constructor(
    public cvc: string,
    public name: string,
    public expiry: string,
    public fourFinalNumbers: string,
    public type: string | undefined
  ) {}
}

export class GetUserPaymentMethodResponse {
  constructor(
    public paymentUserMethodId: string,
    public userId: string,
    public creationDate: Date,
    public paymentMethodId: PaymentMethods,
    public isDefault: boolean,
    public status: PaymentsUserMethodStatus,
    public statusDescription: string,
    public expireDate?: Date,
    public creditCard?: GetCreditCardUserPaymentMethodResponse
  ) {}
}

class GetPaymentUserMethodResponse {
  constructor(
    public defaultPaymentMethod?: PaymentMethods,
    public defaultPaymentUserMethodId?: string,
    public paymentMethods?: GetUserPaymentMethodResponse[]
  ) {}
}

export default GetPaymentUserMethodResponse;
