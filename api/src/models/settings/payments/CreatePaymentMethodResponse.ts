/** @format */

import PaymentMethods from "../../../constants/PaymentMethods";
import PaymentsUserMethodStatus from "../../../constants/PaymentsUserMethodStatus";

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
    public paymentUserMethodId: string,
    public userId: string,
    public creationDate: Date,
    public paymentMethodId: PaymentMethods,
    public isDefault: boolean,
    public status: PaymentsUserMethodStatus,
    public statusDescription: string,
    public expireDate?: Date,
    public creditCard?: CreateCreditCardPaymentMethodResponse
  ) {}
}

export default CreateUserPaymentMethodResponse;
