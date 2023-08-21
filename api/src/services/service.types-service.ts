/** @format */

import { ServiceTypeRepository } from "../db/models/ServiceTypesRepository";
import { CreateServiceTypeRequest } from "../models/customers/services/service-types/CreateServiceTypeRequest";
import { CreateServiceTypeResponse } from "../models/customers/services/service-types/CreateServiceTypeResponse";
import {
  GetServiceTypeResponse,
  GetServiceTypesResponse,
} from "../models/customers/services/service-types/GetServiceTypesResponse";
import { UpdateServiceTypeRequest } from "../models/customers/services/service-types/UpdateServiceTypeRequest";
import { UpdateServiceTypeResponse } from "../models/customers/services/service-types/UpdateServiceTypeResponse";

import { v4 as uuidv4 } from "uuid";

export const CreateServiceType = async (
  userId: string,
  request: CreateServiceTypeRequest
): Promise<CreateServiceTypeResponse> => {
  const serviceTypeId = uuidv4();
  let serviceTypeResponse: CreateServiceTypeResponse | undefined = undefined;
  try {
    const serviceTypeDocument = await ServiceTypeRepository.insertMany({
      userId: userId,
      serviceTypeId: serviceTypeId,
      serviceTypeDescription: request.serviceTypeDescription,
      notes: request.notes,
      isDefault: false,
      creationDate: new Date(),
    });

    serviceTypeResponse = new CreateServiceTypeResponse(
      serviceTypeId,
      serviceTypeDocument[0].creationDate,
      false,
      serviceTypeDocument[0].serviceTypeDescription,
      serviceTypeDocument[0].notes
    );

    return serviceTypeResponse;
  } catch (error: any) {
    await ServiceTypeRepository.deleteMany({ serviceTypeId: serviceTypeId });
    throw error;
  }
};

export const GetServicesTypes = async (
  userId: string,
  serviceTypeDescription?: string
): Promise<GetServiceTypesResponse> => {
  let serviceTypesDocuments: any = [];

  if (serviceTypeDescription) {
    serviceTypesDocuments = await ServiceTypeRepository.find({
      $or: [
        {
          userId: userId,
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
  } else {
    serviceTypesDocuments = await ServiceTypeRepository.find({
      $or: [{ userId: userId }, { isDefault: true }],
    });
  }

  const response: GetServiceTypesResponse = new GetServiceTypesResponse(userId);

  response.serviceTypes = [];
  for (const serviceTypeDocument of serviceTypesDocuments) {
    const proceedingType = new GetServiceTypeResponse(
      serviceTypeDocument.serviceTypeId,
      serviceTypeDocument.serviceTypeDescription,
      serviceTypeDocument.notes,
      serviceTypeDocument.isDefault
    );
    response.serviceTypes?.push(proceedingType);
  }

  response.serviceTypes.sort((a, b) => {
    if (!a.isDefault && b.isDefault) {
      return -1;
    } else if (a.isDefault && !b.isDefault) {
      return 1;
    }

    return a.serviceTypeDescription.localeCompare(b.serviceTypeDescription);
  });

  return response;
};

export const UpdateServiceType = async (
  userId: string,
  request: UpdateServiceTypeRequest
): Promise<UpdateServiceTypeResponse> => {
  try {
    const serviceTypeDocument = await ServiceTypeRepository.findOneAndUpdate(
      {
        userId: userId,
        serviceTypeId: request.serviceTypeId,
        isDefault: false,
      },
      {
        serviceTypeDescription: request.serviceTypeDescription,
        notes: request.notes,
      }
    );

    return new UpdateServiceTypeResponse(
      request.serviceTypeId,
      false,
      request.serviceTypeDescription,
      request.notes
    );
  } catch (error: any) {
    throw error;
  }
};
