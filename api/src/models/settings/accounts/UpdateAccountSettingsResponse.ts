/** @format */

class UpdateAccountSettingsResponse {
  constructor(
    public userPlanId: string,
    public userNameComplete: string,
    public username: string,
    public userBirthdate: Date,
    public userCPF: string,
    public userCreationCompleted: boolean,

    //public paymentProcessingInfo: PaymentProcessingResponse,

    public userAddressCEP: string,
    public userAddressStreet: string,
    public userAddressNumber: string,
    public userAddressDistrict: string,
    public userAddressCity: string,
    public userAddressComplement: string,
    public userAddressState: string,
    public companyName?: string,
    public companyCNPJ?: string,
    public companyNumberOfEmployees?: string
  ) {}
}

export default UpdateAccountSettingsResponse;
