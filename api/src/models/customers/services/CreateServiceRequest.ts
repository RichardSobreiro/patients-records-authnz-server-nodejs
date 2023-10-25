/** @format */

import { GetServiceTypeResponse } from "./service-types/GetServiceTypesResponse";

export class CreateServiceRequest {
  constructor(
    public date: Date,
    public durationHours: number,
    public durationMinutes: number,
    public serviceTypes: GetServiceTypeResponse[],
    public beforeNotes?: string,
    public beforePhotos?: any,
    public afterNotes?: string,
    public afterPhotos?: any
  ) {}
}
