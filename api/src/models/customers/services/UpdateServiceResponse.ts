/** @format */

export class UpdateServicePhotosResponse {
  constructor(
    public serviceId: string,
    public servicePhotoId: string,
    public servicePhotoType: string,
    public creationDate: Date,
    public url: string,
    public urlExpiresOn: Date
  ) {}
}

export class UpdateServiceResponse {
  constructor(
    public serviceId: string,
    public date: Date,
    public serviceTypeDescription: string,
    public notes?: string,
    public beforePhotos?: UpdateServicePhotosResponse[] | null,
    public afterPhotos?: UpdateServicePhotosResponse[] | null
  ) {}
}
