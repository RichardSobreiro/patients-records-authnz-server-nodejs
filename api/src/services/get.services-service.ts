/** @format */
import { ServiceTypeRepository } from "../db/models/ServiceTypesRepository";
import { ServicesRepository } from "../db/models/ServicesRepository";
import { ServicePhotosRepository } from "../db/models/ServicePhotosRepository";
import { CustomersRepository } from "../db/models/CustomersRepository";
import {
  GetServiceResponse,
  GetServicesResponse,
} from "../models/customers/services/GetServiceResponse";

import { createBlobSas } from "./azure/azure.storage.account";
import { GetServiceTypeResponse } from "../models/customers/services/service-types/GetServiceTypesResponse";
import { GetServiceByIdResponse } from "../models/customers/services/GetServiceByIdResponse";
import { GetServicePhotosResponse } from "../models/customers/services/GetServicePhotosResponse";

export const getServiceById = async (
  customerId: string,
  serviceId: string
): Promise<GetServiceByIdResponse> => {
  const customer = await CustomersRepository.findOne({
    customerId: customerId,
  });

  const serviceDocument = await ServicesRepository.findOne({
    serviceId: serviceId,
  });

  const serviceTypeDocuments = await ServiceTypeRepository.find({
    serviceTypeId: { $in: serviceDocument?.serviceTypeIds },
  });

  const servicePhotosDocuments = await ServicePhotosRepository.find({
    serviceId: serviceId,
  });

  const response = new GetServiceByIdResponse(
    serviceDocument?.serviceId!,
    serviceDocument?.customerId!,
    serviceDocument?.date!,
    serviceTypeDocuments!.map(
      (serviceTypeDocument) =>
        new GetServiceTypeResponse(
          serviceTypeDocument.serviceTypeId,
          serviceTypeDocument.serviceTypeDescription,
          serviceTypeDocument.notes,
          serviceTypeDocument.isDefault
        )
    ),
    serviceDocument?.beforeNotes,
    serviceDocument?.afterNotes
  );

  const thresholdDateTime = new Date();
  thresholdDateTime.setHours(thresholdDateTime.getHours() - 1);
  const beforePhotos = servicePhotosDocuments.filter((proceedingPhoto) => {
    return proceedingPhoto.servicePhotoType === "beforePhotos";
  });
  response.beforePhotos = await createPhotoResponse(
    beforePhotos,
    customer?.userId!,
    thresholdDateTime,
    serviceId
  );
  const afterPhotos = servicePhotosDocuments.filter((proceedingPhoto) => {
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

export const getServices = async (
  userId: string,
  customerId: string,
  pageNumberParam: string,
  limitParam?: string,
  startDate?: Date,
  endDate?: Date,
  serviceTypeIds?: string[]
): Promise<GetServicesResponse> => {
  const customer = await CustomersRepository.findOne({
    userId: userId,
    customerId: customerId,
  });

  const pageNumber = parseInt(pageNumberParam) - 1 || 0;
  const limit = (limitParam && parseInt(limitParam)) || 12;

  const filter: any = {};
  filter.userId = userId;
  filter.customerId = customerId;
  if (startDate && endDate) {
    filter.date = { $gte: startDate, $lte: endDate };
  }
  if (serviceTypeIds && serviceTypeIds.length > 0) {
    filter.serviceTypeIds = { $all: serviceTypeIds };
  }

  const startIndex = pageNumber * limit;
  const endIndex = (pageNumber + 1) * limit;

  const serviceDocuments = await ServicesRepository.find(filter)
    .skip(startIndex)
    .limit(limit)
    .exec();

  const servicesCount = serviceDocuments.length;

  const serviceTypeFilteredIds = [
    ...new Set(
      serviceDocuments.map((document) => document.serviceTypeIds).flat()
    ),
  ];

  const serviceTypeFilteredDocuments = await ServiceTypeRepository.find({
    serviceTypeId: { $in: serviceTypeFilteredIds },
  });

  let response = new GetServicesResponse(customerId, servicesCount);

  if (startIndex > 0) {
    response.previous = {
      pageNumber: pageNumber - 1,
      limit: limit,
    };
  }
  if (endIndex < servicesCount) {
    response.next = {
      pageNumber: pageNumber + 1,
      limit: limit,
    };
  }

  response.servicesList = [];
  for (const serviceDocument of serviceDocuments) {
    let serviceTypeDocuments = serviceTypeFilteredDocuments.filter(
      (document) => {
        return (
          serviceDocument.serviceTypeIds.indexOf(document.serviceTypeId) !== -1
        );
      }
    );

    const getServiceTypesResponse: GetServiceTypeResponse[] = [];
    for (const serviceTypeDocument of serviceTypeDocuments) {
      getServiceTypesResponse.push(
        new GetServiceTypeResponse(
          serviceTypeDocument.serviceTypeId,
          serviceTypeDocument.serviceTypeDescription,
          serviceTypeDocument.notes,
          serviceTypeDocument.isDefault
        )
      );
    }

    const getServiceResponse = new GetServiceResponse(
      serviceDocument.serviceId,
      customerId,
      serviceDocument.date,
      getServiceTypesResponse
    );

    response.servicesList?.push(getServiceResponse);
  }

  // const totalProceedings = await ServicesRepository.countDocuments({
  //   customerId: customerId,
  // }).exec();

  // const startIndex = pageNumber * limit;
  // const endIndex = (pageNumber + 1) * limit;
  // const response: GetServicesResponse = new GetServicesResponse(
  //   customer?.customerId!,
  //   totalProceedings
  // );

  // if (startIndex > 0) {
  //   response.previous = {
  //     pageNumber: pageNumber - 1,
  //     limit: limit,
  //   };
  // }
  // if (endIndex < totalProceedings) {
  //   response.next = {
  //     pageNumber: pageNumber + 1,
  //     limit: limit,
  //   };
  // }
  // const proceedingDocuments = await ServicesRepository.find({
  //   customerId: customerId,
  // })
  //   .sort("-_id")
  //   .skip(startIndex)
  //   .limit(limit)
  //   .exec();

  // response.servicesList = [];
  // for (const proceedingDocument of proceedingDocuments) {
  //   const serviceTypeDocuments = await ServiceTypeRepository.findOne({
  //     serviceTypeId: proceedingDocument.serviceTypeId,
  //   });

  //   const serviceDocument = new GetServiceResponse(
  //     proceedingDocument.serviceId!,
  //     proceedingDocument.date,
  //     serviceTypeDocuments!.serviceTypeDescription,
  //     proceedingDocument.notes
  //   );

  //   const thresholdDateTime = new Date();
  //   thresholdDateTime.setHours(thresholdDateTime.getHours() - 1);
  //   const servicePhotosDocuments = await ServicePhotosRepository.find({
  //     serviceId: proceedingDocument.serviceId,
  //   });
  //   const beforePhotos = servicePhotosDocuments.filter((proceedingPhoto) => {
  //     return proceedingPhoto.servicePhotoType === "beforePhotos";
  //   });
  //   serviceDocument.beforePhotos = await createPhotoResponse(
  //     beforePhotos,
  //     customer?.userId!,
  //     thresholdDateTime,
  //     proceedingDocument.serviceId
  //   );
  //   const afterPhotos = servicePhotosDocuments.filter((proceedingPhoto) => {
  //     return proceedingPhoto.servicePhotoType === "afterPhotos";
  //   });
  //   serviceDocument.afterPhotos = await createPhotoResponse(
  //     afterPhotos,
  //     customer?.userId!,
  //     thresholdDateTime,
  //     proceedingDocument.serviceId
  //   );
  //   response.servicesList?.push(serviceDocument);
  // }

  // return response;
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
