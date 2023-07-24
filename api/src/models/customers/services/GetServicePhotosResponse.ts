/** @format */

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
