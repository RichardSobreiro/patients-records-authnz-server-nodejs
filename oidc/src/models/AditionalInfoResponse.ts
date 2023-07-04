/** @format */

export class AditionalInfoResponse {
  constructor(
    public userPlanId: string,
    public userNameComplete: string,
    public userCPF: string,
    public userCreationCompleted: boolean,

    public paymentOk: boolean,
    public paymentStatus: string,

    public userAddressCEP: string,
    public userAddressStreet: string,
    public userAddressDistrict: string,
    public userAddressCity: string,
    public userAddressComplement: string,
    public userAddressState: string,
    public companyName?: string,
    public companyCNPJ?: string,
    public companyNumberOfEmployees?: string
  ) {}
}
