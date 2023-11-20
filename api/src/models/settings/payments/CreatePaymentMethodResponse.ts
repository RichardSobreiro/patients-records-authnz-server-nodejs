/** @format */

import PaymentMethods from "../../../enums/PaymentMethods";
import PaymentsUserMethodStatus from "../../../enums/PaymentsUserMethodStatus";

export class CreateCreditCardPaymentMethodResponse {
  constructor(
    public cvc: string,
    public name: string,
    public expiry: string,
    public fourFinalNumbers: string,
    public type: string
  ) {}
}

class CreateUserPaymentMethodResponse {
  constructor(
    public paymentsUserMethodId: string,
    public userId: string,
    public creationDate: Date,
    public paymentMethodId: PaymentMethods,
    public status: PaymentsUserMethodStatus,
    public statusDescription: string,
    public expireDate?: Date,
    public creditCard?: CreateCreditCardPaymentMethodResponse
  ) {}
}

export default CreateUserPaymentMethodResponse;
