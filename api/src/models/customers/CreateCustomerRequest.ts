/** @format */

export class CreateCustomerRequest {
  constructor(
    public customerName: string,
    public birthDate: Date,
    public cpf: undefined | string,
    public gender: undefined | string,
    public maritalStatus: undefined | string,
    public ethnicity: undefined | string,
    public placeOfBirth: undefined | string,
    public occupation: undefined | string,
    public phoneNumber: string,
    public instagramAccount: undefined | string,
    public email: undefined | string,
    public cep: null | string,
    public street: null | string,
    public number: null | string,
    public district: null | string,
    public city: null | string,
    public complement: null | string,
    public state: null | string
  ) {}
}
