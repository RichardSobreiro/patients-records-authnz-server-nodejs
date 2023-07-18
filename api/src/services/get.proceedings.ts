/** @format */
import { ServiceTypeRepository } from "../db/models/ServiceTypesRepository";
import { Proceedings } from "../db/models/Proceedings";
import { ProceedingPhotos } from "../db/models/ProceedingPhotos";
import { CustomersRepository } from "../db/models/CustomersRepository";
import {
  GetServiceResponse,
  GetServicePhotosResponse,
  GetProceedingsResponse,
} from "../models/customers/services/GetServiceResponse";

import { createBlobSas } from "./azure/azure.storage.account";

export const getProceedingById = async (
  customerId: string,
  serviceId: string
): Promise<GetServiceResponse> => {
  const customer = await CustomersRepository.findOne({
    customerId: customerId,
  });

  const proceeding = await Proceedings.findOne({ serviceId: serviceId });

  const proceedingType = await ServiceTypeRepository.findOne({
    proceedingTypeId: proceeding?.proceedingTypeId,
  });

  const proceedingPhotos = await ProceedingPhotos.find({
    serviceId: serviceId,
  });

  const response = new GetServiceResponse(
    proceeding?.serviceId!,
    proceeding!.date,
    proceedingType!.serviceTypeDescription,
    proceeding!.notes
  );

  const thresholdDateTime = new Date();
  thresholdDateTime.setHours(thresholdDateTime.getHours() - 1);
  const beforePhotos = proceedingPhotos.filter((proceedingPhoto) => {
    return proceedingPhoto.servicePhotoType === "beforePhotos";
  });
  response.beforePhotos = await createPhotoResponse(
    beforePhotos,
    customer?.userId!,
    thresholdDateTime,
    serviceId
  );
  const afterPhotos = proceedingPhotos.filter((proceedingPhoto) => {
    return proceedingPhoto.servicePhotoType === "afterPhotos";
  });
  response.afterPhotos = await createPhotoResponse(
    afterPhotos,
    customer?.userId!,
    thresholdDateTime,
    serviceId
  );

  return response;
};

export const getProceedings = async (
  customerId: string,
  pageNumberParam: string,
  limitParam?: string
): Promise<GetProceedingsResponse> => {
  const customer = await CustomersRepository.findOne({
    customerId: customerId,
  });

  const pageNumber = parseInt(pageNumberParam) || 0;
  const limit = (limitParam && parseInt(limitParam)) || 12;

  const totalProceedings = await Proceedings.countDocuments({
    customerId: customerId,
  }).exec();

  const startIndex = pageNumber * limit;
  const endIndex = (pageNumber + 1) * limit;
  const response: GetProceedingsResponse = new GetProceedingsResponse(
    customer?.customerId!,
    totalProceedings
  );

  if (startIndex > 0) {
    response.previous = {
      pageNumber: pageNumber - 1,
      limit: limit,
    };
  }
  if (endIndex < totalProceedings) {
    response.next = {
      pageNumber: pageNumber + 1,
      limit: limit,
    };
  }
  const proceedingDocuments = await Proceedings.find({
    customerId: customerId,
  })
    .sort("-_id")
    .skip(startIndex)
    .limit(limit)
    .exec();

  response.proceedings = [];
  for (const proceedingDocument of proceedingDocuments) {
    const proceedingType = await ServiceTypeRepository.findOne({
      proceedingTypeId: proceedingDocument.proceedingTypeId,
    });

    const proceeding = new GetServiceResponse(
      proceedingDocument.serviceId!,
      proceedingDocument.date,
      proceedingType!.serviceTypeDescription,
      proceedingDocument.notes
    );

    const thresholdDateTime = new Date();
    thresholdDateTime.setHours(thresholdDateTime.getHours() - 1);
    const proceedingPhotos = await ProceedingPhotos.find({
      serviceId: proceedingDocument.serviceId,
    });
    const beforePhotos = proceedingPhotos.filter((proceedingPhoto) => {
      return proceedingPhoto.servicePhotoType === "beforePhotos";
    });
    proceeding.beforePhotos = await createPhotoResponse(
      beforePhotos,
      customer?.userId!,
      thresholdDateTime,
      proceedingDocument.serviceId
    );
    const afterPhotos = proceedingPhotos.filter((proceedingPhoto) => {
      return proceedingPhoto.servicePhotoType === "afterPhotos";
    });
    proceeding.afterPhotos = await createPhotoResponse(
      afterPhotos,
      customer?.userId!,
      thresholdDateTime,
      proceedingDocument.serviceId
    );
    response.proceedings?.push(proceeding);
  }

  return response;
};

const createPhotoResponse = async (
  photoDocuments: any[],
  userId: string,
  thresholdDateTime: Date,
  serviceId: string
): Promise<GetServicePhotosResponse[]> => {
  const photosResponse: GetServicePhotosResponse[] = [];
  for (const photoDocument of photoDocuments) {
    if (photoDocument.sasTokenExpiresOn < thresholdDateTime) {
      const sasToken = await createBlobSas(userId, photoDocument.filename);
      photoDocument.sasToken = sasToken.sasToken;
      photoDocument.sasTokenExpiresOn = sasToken.expiresOn!;
      photoDocument.save();
    }

    const photoResponse = new GetServicePhotosResponse(
      serviceId,
      photoDocument.servicePhotoId,
      photoDocument.servicePhotoType,
      photoDocument.creationDate,
      `${photoDocument.baseUrl}?${photoDocument.sasToken}`,
      photoDocument.sasTokenExpiresOn
    );

    photosResponse.push(photoResponse);
  }
  return photosResponse;
};
