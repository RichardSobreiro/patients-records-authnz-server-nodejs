/** @format */
import { ProceedingTypes } from "../db/models/ProceedingTypes";
import { Proceedings } from "../db/models/Proceedings";
import { ProceedingPhotos } from "../db/models/ProceedingPhotos";
import { CustomersRepository } from "../db/models/CustomersRepository";
import {
  GetProceedingResponse,
  GetProceedingPhotosResponse,
  GetProceedingsResponse,
} from "../models/customers/proceedings/GetProceedingResponse";

import { createBlobSas } from "./azure/azure.storage.account";
import {
  GetProceedingTypeResponse,
  GetProceedingTypesResponse,
} from "../models/customers/proceedings/GetProceedingTypesResponse";

export const getProceedingById = async (
  customerId: string,
  proceedingId: string
): Promise<GetProceedingResponse> => {
  const customer = await CustomersRepository.findOne({
    customerId: customerId,
  });

  const proceeding = await Proceedings.findOne({ proceedingId: proceedingId });

  const proceedingType = await ProceedingTypes.findOne({
    proceedingTypeId: proceeding?.proceedingTypeId,
  });

  const proceedingPhotos = await ProceedingPhotos.find({
    proceedingId: proceedingId,
  });

  const response = new GetProceedingResponse(
    proceeding?.proceedingId!,
    proceeding!.date,
    proceedingType!.proceedingTypeDescription,
    proceeding!.notes
  );

  const thresholdDateTime = new Date();
  thresholdDateTime.setHours(thresholdDateTime.getHours() - 1);
  const beforePhotos = proceedingPhotos.filter((proceedingPhoto) => {
    return proceedingPhoto.proceedingPhotoType === "beforePhotos";
  });
  response.beforePhotos = await createPhotoResponse(
    beforePhotos,
    customer?.userId!,
    thresholdDateTime,
    proceedingId
  );
  const afterPhotos = proceedingPhotos.filter((proceedingPhoto) => {
    return proceedingPhoto.proceedingPhotoType === "afterPhotos";
  });
  response.afterPhotos = await createPhotoResponse(
    afterPhotos,
    customer?.userId!,
    thresholdDateTime,
    proceedingId
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
    const proceedingType = await ProceedingTypes.findOne({
      proceedingTypeId: proceedingDocument.proceedingTypeId,
    });

    const proceeding = new GetProceedingResponse(
      proceedingDocument.proceedingId!,
      proceedingDocument.date,
      proceedingType!.proceedingTypeDescription,
      proceedingDocument.notes
    );

    const thresholdDateTime = new Date();
    thresholdDateTime.setHours(thresholdDateTime.getHours() - 1);
    const proceedingPhotos = await ProceedingPhotos.find({
      proceedingId: proceedingDocument.proceedingId,
    });
    const beforePhotos = proceedingPhotos.filter((proceedingPhoto) => {
      return proceedingPhoto.proceedingPhotoType === "beforePhotos";
    });
    proceeding.beforePhotos = await createPhotoResponse(
      beforePhotos,
      customer?.userId!,
      thresholdDateTime,
      proceedingDocument.proceedingId
    );
    const afterPhotos = proceedingPhotos.filter((proceedingPhoto) => {
      return proceedingPhoto.proceedingPhotoType === "afterPhotos";
    });
    proceeding.afterPhotos = await createPhotoResponse(
      afterPhotos,
      customer?.userId!,
      thresholdDateTime,
      proceedingDocument.proceedingId
    );
    response.proceedings?.push(proceeding);
  }

  return response;
};

const createPhotoResponse = async (
  photoDocuments: any[],
  userId: string,
  thresholdDateTime: Date,
  proceedingId: string
): Promise<GetProceedingPhotosResponse[]> => {
  const photosResponse: GetProceedingPhotosResponse[] = [];
  for (const photoDocument of photoDocuments) {
    if (photoDocument.sasTokenExpiresOn < thresholdDateTime) {
      const sasToken = await createBlobSas(userId, photoDocument.filename);
      photoDocument.sasToken = sasToken.sasToken;
      photoDocument.sasTokenExpiresOn = sasToken.expiresOn!;
      photoDocument.save();
    }

    const photoResponse = new GetProceedingPhotosResponse(
      proceedingId,
      photoDocument.proceedingPhotoId,
      photoDocument.proceedingPhotoType,
      photoDocument.creationDate,
      `${photoDocument.baseUrl}?${photoDocument.sasToken}`,
      photoDocument.sasTokenExpiresOn
    );

    photosResponse.push(photoResponse);
  }
  return photosResponse;
};

export const getProceedingsTypesByEmail = async (
  email: string
): Promise<GetProceedingTypesResponse> => {
  const proceedingTypeDocuments = await ProceedingTypes.find({
    userId: email,
  });

  const response: GetProceedingTypesResponse = new GetProceedingTypesResponse(
    email
  );

  response.proceedingsTypes = [];
  for (const proceedingTypeDocument of proceedingTypeDocuments) {
    const proceedingType = new GetProceedingTypeResponse(
      proceedingTypeDocument.proceedingTypeId,
      proceedingTypeDocument.proceedingTypeDescription,
      proceedingTypeDocument.notes
    );
    response.proceedingsTypes?.push(proceedingType);
  }

  return response;
};
