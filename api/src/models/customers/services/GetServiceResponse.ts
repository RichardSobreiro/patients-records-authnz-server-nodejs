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

export class GetServiceResponse {
  constructor(
    public serviceId: string,
    public date: Date,
    public serviceTypeDescription: string,
    public notes?: string,
    public beforePhotos?: GetServicePhotosResponse[] | null,
    public afterPhotos?: GetServicePhotosResponse[] | null
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
    public proceedings?: GetServiceResponse[] | null
  ) {}
}
