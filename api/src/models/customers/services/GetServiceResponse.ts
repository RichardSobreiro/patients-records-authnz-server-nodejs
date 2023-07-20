/** @format */

import { CreateServicePhotosResponse } from "./CreateServiceResponse";
import { GetServiceTypeResponse } from "./service-types/GetServiceTypesResponse";

export class GetServicePhotosResponse {
  constructor(
    public serviceId: string,
    public servicePhotoId: string,
    public servicePhotoType: string,
    public creationDate: Date,
    public url: string,
    public urlExpiresOn: Date
  ) {}
}

export class GetServiceResponse {
  constructor(
    public serviceId: string,
    public customerId: string,
    public date: Date,
    public serviceTypes: GetServiceTypeResponse[],
    public beforeNotes?: string,
    public afterNotes?: string,
    public beforePhotos?: CreateServicePhotosResponse[] | null,
    public afterPhotos?: CreateServicePhotosResponse[] | null
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
