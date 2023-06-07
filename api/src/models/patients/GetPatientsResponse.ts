/** @format */

export class GetPatient {
  constructor(
    public userId: string,
    public patientId: string,
    public patientName: string,
    public phoneNumber: string,
    public birthDate: Date,
    public creationDate: Date,
    public email?: string,
    public mostRecentProceedingId?: string,
    public mostRecentProceedingDate?: Date,
    public mostRecentProceedingAfterPhotoUrl?: string
  ) {}
}

class ListPage {
  constructor(public pageNumber: number, public limit: number) {}
}

export class GetPatientsResponse {
  constructor(
    public userId: string,
    public patientsCount: number,
    public previous?: ListPage,
    public next?: ListPage,
    public patients?: GetPatient[]
  ) {}
}
