/** @format */

import { GetServiceTypeResponse } from "./service-types/GetServiceTypesResponse";

export class CreateServiceRequest {
  constructor(
    public date: Date,
    public serviceTypes: GetServiceTypeResponse[],
    public beforeNotes?: string,
    public beforePhotos?: any,
    public afterNotes?: string,
    public afterPhotos?: any
  ) {}
}
