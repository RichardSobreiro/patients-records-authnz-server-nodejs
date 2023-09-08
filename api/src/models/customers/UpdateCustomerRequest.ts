/** @format */

export class UpdateCustomerRequest {
  constructor(
    public customerId: string,
    public customerName: string,
    public birthDate: Date,
    public cpf: undefined | string,
    public gender: undefined | string,
    public maritalStatus: undefined | string,
    public ethnicity: undefined | string,
    public placeOfBirth: undefined | string,
    public occupation: undefined | string,
    public phoneNumber: string,
    public instagramAccount: string | undefined,
    public email: string | undefined,
    public cep: string | undefined,
    public street: string | undefined,
    public number: string | undefined,
    public district: string | undefined,
    public city: string | undefined,
    public complement: string | undefined,
    public state: string | undefined
  ) {}
}
