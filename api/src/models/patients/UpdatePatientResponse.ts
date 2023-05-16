/** @format */

export class UpdatePatientResponse {
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
