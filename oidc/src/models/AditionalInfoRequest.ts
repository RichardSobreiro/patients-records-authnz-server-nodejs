/** @format */

export class CreditCardPaymentInfo {
  constructor(
    public encrypted: string,
    public securityCode: string,
    public holderName: string
  ) {}
}

export class PaymentInfoRequest {
  constructor(
    public paymentTypeCode: string | number,
    public creditCardInfo?: CreditCardPaymentInfo
  ) {}
}

export class AditionalInfoRequest {
  constructor(
    public userPlanId: string,
    public userNameComplete: string,
    public userCPF: string,
    public phoneAreaCode: string,
    public phoneNumber: string,
    public userAddressCEP: string,
    public userAddressStreet: string,
    public userAddressNumber: string,
    public userAddressDistrict: string,
    public userAddressCity: string,
    public userAddressComplement: string,
    public userAddressState: string,
    public companyName?: string,
    public companyCNPJ?: string,
    public companyNumberOfEmployees?: string,
    public paymentInfo?: PaymentInfoRequest
  ) {}
}
