/** @format */

export class CreatePatientRequest {
  constructor(
    public username: string,
    public patientName: string,
    public phoneNumber: string,
    public birthDate: Date,
    public email?: string
  ) {}
}
