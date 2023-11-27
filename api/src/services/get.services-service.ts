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
import {
  GetServiceAgendaResponse,
  GetServiceTypeAgendaResponse,
  GetServicesAgendaResponse,
} from "../models/customers/services/GetServiceAgendaResponse ";
import ServiceStatus from "../constants/ServiceStatus";

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
    serviceDocument?.durationHours!,
    serviceDocument?.durationMinutes!,
    serviceTypeDocuments!.map(
      (serviceTypeDocument) =>
        new GetServiceTypeResponse(
          serviceTypeDocument.serviceTypeId,
          serviceTypeDocument.serviceTypeDescription,
          serviceTypeDocument.notes,
          serviceTypeDocument.isDefault
        )
    ),
    serviceDocument?.status ?? ServiceStatus.Unconfirmed,
    serviceDocument?.sendReminder ?? false,
    serviceDocument?.reminderMessageAdvanceTime ?? 24,
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
  serviceTypeIds?: string[],
  serviceTypeDescription?: string
): Promise<GetServicesResponse> => {
  const pageNumber = parseInt(pageNumberParam) - 1 || 0;
  const limit = (limitParam && parseInt(limitParam)) || 12;

  if (serviceTypeDescription) {
    const serviceTypeByDescriptionDocuments = await ServiceTypeRepository.find({
      $or: [
        {
          userId: userId,
          isDefault: false,
          serviceTypeDescription: {
            $regex: serviceTypeDescription,
            $options: "i",
          },
        },
        {
          isDefault: true,
          serviceTypeDescription: {
            $regex: serviceTypeDescription,
            $options: "i",
          },
        },
      ],
    });
    if (
      serviceTypeByDescriptionDocuments &&
      serviceTypeByDescriptionDocuments.length > 0
    ) {
      if (serviceTypeIds && serviceTypeIds.length > 0) {
        serviceTypeIds = serviceTypeIds.concat(
          serviceTypeByDescriptionDocuments.map((s) => s.serviceTypeId)
        );
      } else {
        serviceTypeIds = serviceTypeByDescriptionDocuments.map(
          (s) => s.serviceTypeId
        );
      }
    } else {
      const responseEmpty = new GetServicesResponse(customerId, 0);

      responseEmpty.previous = undefined;
      responseEmpty.next = undefined;

      responseEmpty.servicesList = [];
      return responseEmpty;
    }
  }

  const filter: any = {};
  filter.userId = userId;
  filter.customerId = customerId;

  if (serviceTypeDescription) {
  }

  if (startDate && endDate) {
    filter.date = { $gte: startDate, $lte: endDate };
  }

  if (serviceTypeIds && serviceTypeIds.length > 0) {
    filter.serviceTypeIds = { $in: serviceTypeIds };
  }

  const startIndex = pageNumber * limit;
  const endIndex = (pageNumber + 1) * limit;

  const serviceDocuments = await ServicesRepository.find(filter)
    .sort({ date: "desc" })
    .skip(startIndex)
    .limit(limit)
    .exec();

  const servicesCount = await ServicesRepository.countDocuments(filter).exec();

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

export const getServicesAgenda = async (
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<GetServicesAgendaResponse> => {
  const filter: any = {};
  filter.userId = userId;

  if (!startDate && !endDate) {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0);
    endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    endDate.setHours(23, 59, 0);
  }
  filter.date = { $gte: startDate, $lte: endDate };

  const serviceDocuments = await ServicesRepository.find(filter)
    .sort({ date: "desc" })
    .exec();

  const servicesCount = await ServicesRepository.countDocuments(filter).exec();

  const serviceTypeFilteredIds = [
    ...new Set(
      serviceDocuments.map((document) => document.serviceTypeIds).flat()
    ),
  ];

  const serviceTypeFilteredDocuments = await ServiceTypeRepository.find({
    serviceTypeId: { $in: serviceTypeFilteredIds },
  });

  const customerDocumentsIds = [
    ...new Set(serviceDocuments.map((document) => document.customerId).flat()),
  ];

  const customerDocuments = await CustomersRepository.find({
    customerId: { $in: customerDocumentsIds },
  });

  let response = new GetServicesAgendaResponse(servicesCount);

  response.servicesList = [];
  for (const serviceDocument of serviceDocuments) {
    let serviceTypeDocuments = serviceTypeFilteredDocuments.filter(
      (document) => {
        return (
          serviceDocument.serviceTypeIds.indexOf(document.serviceTypeId) !== -1
        );
      }
    );

    const currentCustomerServiceOwner = customerDocuments.find(
      (c) => c.customerId === serviceDocument.customerId
    );

    if (
      !currentCustomerServiceOwner ||
      currentCustomerServiceOwner === undefined
    ) {
      throw new Error(
        `Customer not found - customerId = ${serviceDocument.customerId}`
      );
    }

    const getServiceTypesResponse: GetServiceTypeAgendaResponse[] = [];
    for (const serviceTypeDocument of serviceTypeDocuments) {
      getServiceTypesResponse.push(
        new GetServiceTypeAgendaResponse(
          serviceTypeDocument.serviceTypeId,
          serviceTypeDocument.serviceTypeDescription,
          serviceTypeDocument.notes,
          serviceTypeDocument.isDefault
        )
      );
    }

    const getServiceResponse = new GetServiceAgendaResponse(
      serviceDocument.serviceId,
      currentCustomerServiceOwner.customerId,
      currentCustomerServiceOwner.customerName,
      currentCustomerServiceOwner.phoneNumber,
      serviceDocument.date,
      getServiceTypesResponse,
      serviceDocument.durationHours,
      serviceDocument.durationMinutes,
      serviceDocument.status,
      serviceDocument.sendReminder,
      serviceDocument.reminderMessageAdvanceTime
    );

    response.servicesList?.push(getServiceResponse);
  }
  return response;
};
