/** @format */

export class GetCustomer {
  constructor(
    public userId: string,
    public customerId: string,
    public customerName: string,
    public phoneNumber: string,
    public birthDate: Date,
    public creationDate: Date,
    public email?: string,
    public mostRecentProceedingId?: string,
    public mostRecentProceedingDate?: Date,
    public mostRecentProceedingAfterPhotoUrl?: string
  ) {}
}

export class ListPage {
  constructor(public pageNumber: number, public limit: number) {}
}

export class GetCustomersResponse {
  constructor(
    public userId: string,
    public customersCount: number,
    public previous?: ListPage,
    public next?: ListPage,
    public customers?: GetCustomer[]
  ) {}
}
