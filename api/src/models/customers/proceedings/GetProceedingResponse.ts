/** @format */

export class GetProceedingPhotosResponse {
  constructor(
    public proceedingId: string,
    public proceedingPhotoId: string,
    public proceedingPhotoType: string,
    public creationDate: Date,
    public url: string,
    public urlExpiresOn: Date
  ) {}
}

export class GetProceedingResponse {
  constructor(
    public proceedingId: string,
    public date: Date,
    public proceedingTypeDescription: string,
    public notes?: string,
    public beforePhotos?: GetProceedingPhotosResponse[] | null,
    public afterPhotos?: GetProceedingPhotosResponse[] | null
  ) {}
}

class ListPage {
  constructor(public pageNumber: number, public limit: number) {}
}

export class GetProceedingsResponse {
  constructor(
    public customerId: string,
    public proceedingsCount: number,
    public previous?: ListPage,
    public next?: ListPage,
    public proceedings?: GetProceedingResponse[] | null
  ) {}
}
