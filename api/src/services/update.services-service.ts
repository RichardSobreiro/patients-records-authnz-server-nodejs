/** @format */
import { ServiceTypeRepository } from "../db/models/ServiceTypesRepository";
import { ServicesRepository } from "../db/models/ServicesRepository";
import { ServicePhotosRepository } from "../db/models/ServicePhotosRepository";
import { CustomersRepository } from "../db/models/CustomersRepository";
import { UpdateServiceRequest } from "../models/customers/services/UpdateServiceRequest";
import {
  UpdateServicePhotosResponse,
  UpdateServiceResponse,
} from "../models/customers/services/UpdateServiceResponse";
import {
  createBlobClient,
  createContainerClient,
  createBlobSas,
  getBaseBlobURL,
} from "./azure/azure.storage.account";

import { v4 as uuidv4 } from "uuid";
import { ContainerClient } from "@azure/storage-blob";

export const updateService = async (
  userId: string,
  customerId: string,
  serviceId: string,
  request: UpdateServiceRequest,
  files: any
): Promise<UpdateServiceResponse> => {
  await ServicesRepository.findOneAndUpdate(
    { userId: userId, customerId: customerId, serviceId: serviceId },
    {
      date: new Date(request.date),
      durationHours: request.durationHours,
      durationMinutes: request.durationMinutes,
      serviceTypeIds: request.serviceTypes.map((type) => type.serviceTypeId),
      beforeNotes: request.beforeNotes,
      afterNotes: request.afterNotes,
    }
  );

  const response = new UpdateServiceResponse(
    serviceId,
    customerId,
    request!.date,
    request!.durationHours,
    request!.durationMinutes,
    request.serviceTypes,
    request!.beforeNotes,
    request.afterNotes
  );

  const beforePhotosFromClient = files["beforePhotos"];
  response.beforePhotos = await processPhotos(
    "beforePhotos",
    serviceId,
    userId,
    beforePhotosFromClient,
    request.existingBeforePhotosIds
  );

  const afterPhotosFromClient = files["afterPhotos"];
  response.afterPhotos = await processPhotos(
    "afterPhotos",
    serviceId,
    userId,
    afterPhotosFromClient,
    request.existingAfterPhotosIds
  );

  return response;
};

const processPhotos = async (
  photosType: "beforePhotos" | "afterPhotos",
  serviceId: string,
  userId: string,
  photosFromClient: any[] | undefined,
  existingPhotosIds?: string[] | undefined
): Promise<UpdateServicePhotosResponse[] | null | undefined> => {
  const containerClient = await createContainerClient(userId);
  const updatedPhotos: UpdateServicePhotosResponse[] | null | undefined = [];

  const existingPhotosDocuments = await ServicePhotosRepository.find({
    serviceId: serviceId,
    servicePhotoType: photosType,
  });

  if (photosFromClient && photosFromClient.length > 0) {
    if (!Array.isArray(photosFromClient)) {
      photosFromClient = [photosFromClient];
    }
    for (const photoFromClient of photosFromClient) {
      const existingPhotoDocument = existingPhotosDocuments.find(
        (document) => document.servicePhotoId === photoFromClient.originalname
      );
      if (!existingPhotoDocument) {
        const createdPhoto = await createServicePhoto(
          photoFromClient,
          photosType,
          containerClient,
          serviceId,
          userId
        );
        updatedPhotos.push(createdPhoto);
      } else {
        const photo = new UpdateServicePhotosResponse(
          serviceId,
          existingPhotoDocument.servicePhotoId,
          existingPhotoDocument.servicePhotoType,
          existingPhotoDocument.creationDate,
          `${existingPhotoDocument.baseUrl}?${existingPhotoDocument.sasToken}`,
          existingPhotoDocument.sasTokenExpiresOn
        );
        updatedPhotos.push(photo);
      }
    }
  }

  if (existingPhotosDocuments && existingPhotosDocuments.length > 0) {
    if (existingPhotosIds && !Array.isArray(existingPhotosIds)) {
      existingPhotosIds = [existingPhotosIds];
    }
    for (const existingPhotoDocument of existingPhotosDocuments) {
      const deletedPhoto = existingPhotosIds?.find(
        (existingPhotosId) =>
          existingPhotosId === existingPhotoDocument.servicePhotoId
      );
      if (!deletedPhoto) {
        await containerClient.deleteBlob(existingPhotoDocument.filename);
        await ServicePhotosRepository.deleteMany({
          serviceId: serviceId,
          servicePhotoId: existingPhotoDocument.servicePhotoId,
        });
      } else {
        const photo = new UpdateServicePhotosResponse(
          serviceId,
          existingPhotoDocument.servicePhotoId,
          existingPhotoDocument.servicePhotoType,
          existingPhotoDocument.creationDate,
          `${existingPhotoDocument.baseUrl}?${existingPhotoDocument.sasToken}`,
          existingPhotoDocument.sasTokenExpiresOn
        );
        updatedPhotos.push(photo);
      }
    }
  }

  return updatedPhotos;
};

const createServicePhoto = async (
  photoToBeCreated: any,
  photoType: string,
  containerClient: ContainerClient,
  serviceId: string,
  username: string
): Promise<UpdateServicePhotosResponse> => {
  const imageType = photoToBeCreated.mimetype.slice(
    photoToBeCreated.mimetype.indexOf("/") + 1
  );
  const servicePhotoId = uuidv4();
  const filename = `${servicePhotoId}.${imageType}`;
  const baseUrl = getBaseBlobURL(username, filename);

  const blobClient = await createBlobClient(containerClient, filename);

  const options = {
    blobHTTPHeaders: {
      blobContentType: photoToBeCreated.mimetype,
      blobContentEncoding: photoToBeCreated.encoding,
    },
  };

  await blobClient.uploadData(photoToBeCreated.buffer, options);

  const sasToken = await createBlobSas(username, filename);

  const servicePhotoCreatedDocument = await ServicePhotosRepository.create({
    serviceId: serviceId,
    creationDate: new Date(),
    servicePhotoId: servicePhotoId,
    servicePhotoType: photoType,
    mimeType: photoToBeCreated.mimetype,
    imageType: imageType,
    contentEncoding: photoToBeCreated.encoding,
    filename: filename,
    baseUrl: baseUrl,
    sasToken: sasToken.sasToken,
    sasTokenExpiresOn: sasToken.expiresOn,
  });

  const photoResponse = new UpdateServicePhotosResponse(
    serviceId,
    servicePhotoCreatedDocument.servicePhotoId,
    servicePhotoCreatedDocument.servicePhotoType,
    servicePhotoCreatedDocument.creationDate,
    `${baseUrl}?${servicePhotoCreatedDocument.sasToken}`,
    servicePhotoCreatedDocument.sasTokenExpiresOn
  );

  return photoResponse;
};
