/** @format */

export class GetPatient {
  constructor(
    public username: string,
    public patientId: string,
    public patientName: string,
    public phoneNumber: string,
    public birthDate: Date,
    public creationDate: Date,
    public email?: string
  ) {}
}

export class GetPatientsResponse {
  constructor(public count: number, public patients?: GetPatient[]) {}
}
