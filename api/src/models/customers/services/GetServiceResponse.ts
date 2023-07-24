/** @format */

import { GetServiceTypeResponse } from "./service-types/GetServiceTypesResponse";

export class GetServiceResponse {
  constructor(
    public serviceId: string,
    public customerId: string,
    public customerName: string,
    public phoneNumber: string,
    public date: Date,
    public serviceTypes: GetServiceTypeResponse[]
  ) {}
}

class ListPage {
  constructor(public pageNumber: number, public limit: number) {}
}

export class GetServicesResponse {
  constructor(
    public customerId: string,
    public servicesCount: number,
    public previous?: ListPage,
    public next?: ListPage,
    public servicesList?: GetServiceResponse[] | null
  ) {}
}
