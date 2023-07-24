/** @format */

import { GetServicePhotosResponse } from "./GetServicePhotosResponse";
import { GetServiceTypeResponse } from "./service-types/GetServiceTypesResponse";

export class GetServiceByIdResponse {
  constructor(
    public serviceId: string,
    public customerId: string,
    public date: Date,
    public serviceTypes: GetServiceTypeResponse[],
    public beforeNotes?: string,
    public afterNotes?: string,
    public beforePhotos?: GetServicePhotosResponse[] | null,
    public afterPhotos?: GetServicePhotosResponse[] | null
  ) {}
}
