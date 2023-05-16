/** @format */

export class CreatePatientResponse {
  constructor(
    public userId: string,
    public patientId: string,
    public patientName: string,
    public phoneNumber: string,
    public birthDate: Date,
    public creationDate: Date,
    public email?: string
  ) {}
}
