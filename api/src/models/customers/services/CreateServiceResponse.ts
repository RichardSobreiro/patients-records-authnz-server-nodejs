/** @format */

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
    public date: Date,
    public serviceTypeDescription: string,
    public notes?: string,
    public beforePhotos?: CreateServicePhotosResponse[] | null,
    public afterPhotos?: CreateServicePhotosResponse[] | null
  ) {}
}
