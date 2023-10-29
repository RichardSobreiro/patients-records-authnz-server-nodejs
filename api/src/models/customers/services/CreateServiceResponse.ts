/** @format */

import { GetServiceTypeResponse } from "./service-types/GetServiceTypesResponse";

export class CreateServicePhotosResponse {
  constructor(
    public serviceId: string,
    public servicePhotoId: string,
    public servicePhotoType: string,
    public creationDate: Date,
    public url: string,
    public urlExpiresOn: Date
  ) {}
}

export class CreateServiceResponse {
  constructor(
    public serviceId: string,
    public customerId: string,
    public date: Date,
    public durationHours: number,
    public durationMinutes: number,
    public serviceTypes: GetServiceTypeResponse[],
    public status: string,
    public sendReminder: boolean,
    public reminderMessageAdvanceTime: number,
    public beforeNotes?: string,
    public afterNotes?: string,
    public beforePhotos?: CreateServicePhotosResponse[] | null,
    public afterPhotos?: CreateServicePhotosResponse[] | null
  ) {}
}
