/** @format */

import PaymentMethods from "../../../constants/PaymentMethods";

class CreateCreditCardPaymentMethodRequest {
  constructor(
    public cvc: string,
    public name: string,
    public expiry: string,
    public encryptedCard: string,
    public fourFinalNumbers: string,
    public type: string
  ) {}
}

class CreateUserPaymentMethodRequest {
  constructor(
    public paymentMethodId: PaymentMethods,
    public isDefault: boolean,
    public creditCard?: CreateCreditCardPaymentMethodRequest
  ) {}
}

export default CreateUserPaymentMethodRequest;
