/** @format */

class CreatePaymentRequest {
  constructor(
    public paymentUserMethodId: string,
    public firstRecurrentPayment: boolean
  ) {}
}

export default CreatePaymentRequest;
