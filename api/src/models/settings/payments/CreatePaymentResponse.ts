/** @format */

import PaymentInstalmentsStatus from "../../../constants/PaymentInstalmentsStatus";

export class CreatePaymentResponse {
  constructor(
    public paymentInstalmentsId: string,
    public paymentUserMethodId: string,
    public userId: string,
    public creationDate: Date,
    public instalmentNumber: string,
    public status: PaymentInstalmentsStatus,
    public statusDescription: string,
    public expireDate?: Date,
    public paymentDate?: Date
  ) {}
}

export default CreatePaymentResponse;
