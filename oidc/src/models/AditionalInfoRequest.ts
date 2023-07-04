/** @format */

export class AditionalInfoRequest {
  constructor(
    public userPlanId: string,
    public userNameComplete: string,
    public userCPF: string,
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
