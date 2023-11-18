/** @format */

import PaymentMethods from "../../../enums/PaymentMethods";

class CreditCard {
  constructor(
    public cvc: string,
    public name: string,
    public expiry: string,
    public number: string,
    public type: string
  ) {}
}

class PaymentRequest {
  constructor(
    public paymentMethodId: PaymentMethods,
    public creditCard?: CreditCard | undefined
  ) {}
}

export default PaymentRequest;
