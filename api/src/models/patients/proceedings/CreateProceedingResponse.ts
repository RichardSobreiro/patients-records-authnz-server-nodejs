/** @format */

export class CreateProceedingPhotosResponse {
  constructor(
    public proceedingId: string,
    public proceedingPhotoId: string,
    public proceedingPhotoType: string,
    public creationDate: Date,
    public url: string,
    public urlExpiresOn: Date
  ) {}
}

export class CreateProceedingResponse {
  constructor(
    public proceedingId: string,
    public date: Date,
    public proceedingTypeDescription: string,
    public notes?: string,
    public beforePhotos?: CreateProceedingPhotosResponse[] | null,
    public afterPhotos?: CreateProceedingPhotosResponse[] | null
  ) {}
}
