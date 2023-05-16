/** @format */

export class UpdateProceedingPhotosResponse {
  constructor(
    public proceedingId: string,
    public proceedingPhotoId: string,
    public proceedingPhotoType: string,
    public creationDate: Date,
    public url: string,
    public urlExpiresOn: Date
  ) {}
}

export class UpdateProceedingResponse {
  constructor(
    public proceedingId: string,
    public date: Date,
    public proceedingTypeDescription: string,
    public notes?: string,
    public beforePhotos?: UpdateProceedingPhotosResponse[] | null,
    public afterPhotos?: UpdateProceedingPhotosResponse[] | null
  ) {}
}
