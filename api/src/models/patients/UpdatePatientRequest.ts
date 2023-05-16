/** @format */

export class UpdatePatientRequest {
  constructor(
    public userId: string,
    public patientId: string,
    public patientName: string,
    public phoneNumber: string,
    public birthDate: Date,
    public email?: string
  ) {}
}
