/** @format */

import { GetServiceTypeResponse } from "./service-types/GetServiceTypesResponse";

export class UpdateServiceRequest {
  constructor(
    public serviceId: string,
    public date: Date,
    public durationHours: number,
    public durationMinutes: number,
    public serviceTypes: GetServiceTypeResponse[],
    public beforeNotes?: string,
    public existingBeforePhotosIds?: string[],
    public beforePhotos?: any,
    public afterNotes?: string,
    public existingAfterPhotosIds?: string[],
    public afterPhotos?: any
  ) {}
}
