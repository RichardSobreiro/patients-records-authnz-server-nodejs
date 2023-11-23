/** @format */

import PaymentInstalmentsStatus from "../../../enums/PaymentInstalmentsStatus";

class GetPaymentInstalmentResponse {
  constructor(
    public paymentInstalmentsId: string,
    public paymentUserMethodId: string,
    public userId: string,
    public creationDate: Date,
    public instalmentNumber: string,
    public status: PaymentInstalmentsStatus,
    public statusDescription: string,
    public expireDate?: Date
  ) {}
}

export default GetPaymentInstalmentResponse;
