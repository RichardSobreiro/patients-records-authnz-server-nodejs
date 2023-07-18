/** @format */

export class CreateServiceRequest {
  constructor(
    public date: Date,
    public serviceTypeId: string,
    public serviceTypeDescription: string,
    public notes: string,
    public beforePhotos?: any,
    public afterPhotos?: any
  ) {}
}
