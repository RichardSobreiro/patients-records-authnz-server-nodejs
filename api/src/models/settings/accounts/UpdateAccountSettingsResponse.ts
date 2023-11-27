/** @format */

class UpdateAccountSettingsResponse {
  constructor(
    public userPlanId: string,
    public userNameComplete: string,
    public username: string,
    public userBirthdate: Date,
    public userGender: string,
    public userCPF: string,
    public userCreationCompleted: boolean,

    public phoneNumber: string,
    public phoneNumberVerified: boolean,
    public email: string,
    public emailVerified: boolean,

    public referPronoun: string,
    public messageProfessionalName: string,

    public userAddressCEP: string,
    public userAddressStreet: string,
    public userAddressNumber: string,
    public userAddressDistrict: string,
    public userAddressCity: string,
    public userAddressComplement: string,
    public userAddressState: string,
    public companyName?: string,
    public companyCNPJ?: string,
    public companyNumberOfEmployees?: number | string
  ) {}
}

export default UpdateAccountSettingsResponse;
