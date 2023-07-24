/** @format */
import { ServicesRepository } from "../db/models/ServicesRepository";
import { ServicePhotosRepository } from "../db/models/ServicePhotosRepository";
import { CustomersRepository } from "../db/models/CustomersRepository";
import { CreateServiceRequest } from "../models/customers/services/CreateServiceRequest";
import {
  CreateServicePhotosResponse,
  CreateServiceResponse,
} from "../models/customers/services/CreateServiceResponse";
import {
  createBlobClient,
  createContainerClient,
  createBlobSas,
  getBaseBlobURL,
} from "./azure/azure.storage.account";

import { v4 as uuidv4 } from "uuid";
import { ContainerClient } from "@azure/storage-blob";

export const createService = async (
  userId: string,
  customerId: string,
  request: CreateServiceRequest,
  files: any
): Promise<CreateServiceResponse> => {
  const serviceId = uuidv4();

  const customer = await CustomersRepository.findOne({
    customerId: customerId,
  });
  try {
    const serviceDocument = await ServicesRepository.create({
      serviceId: serviceId,
      customerId: customerId,
      userId: userId,
      creationDate: new Date(),
      date: new Date(request.date),
      serviceTypeIds: request.serviceTypes.map((type) => type.serviceTypeId),
      beforeNotes: request.beforeNotes,
      afterNotes: request.afterNotes,
    });

    const response = new CreateServiceResponse(
      serviceDocument.serviceId,
      serviceDocument.customerId,
      serviceDocument.date,
      request.serviceTypes,
      serviceDocument.beforeNotes,
      serviceDocument.afterNotes
    );

    const containerClient = await createContainerClient(customer?.userId!);

    containerClient.createIfNotExists();

    const beforePhotos = files["beforePhotos"];
    if (beforePhotos && beforePhotos.length > 0) {
      response.beforePhotos = await processBeforePhotos(
        beforePhotos,
        containerClient,
        serviceDocument.serviceId,
        customer?.userId!
      );
    }

    const afterPhotos = files["afterPhotos"];
    if (afterPhotos && afterPhotos.length > 0) {
      response.afterPhotos = await processAfterPhotos(
        afterPhotos,
        containerClient,
        serviceDocument.serviceId,
        customer?.userId!
      );
    }

    return response;
  } catch (error: any) {
    ServicePhotosRepository.deleteMany({ serviceId: serviceId });
    ServicesRepository.deleteMany({ serviceId: serviceId });
    throw error;
  }
};

const processBeforePhotos = async (
  beforePhotos: any[],
  containerClient: ContainerClient,
  serviceId: string,
  username: string
): Promise<CreateServicePhotosResponse[] | null> => {
  if (beforePhotos && beforePhotos.length > 0) {
    const beforePhotosResponse: CreateServicePhotosResponse[] =
      await processPhotos(
        beforePhotos,
        "beforePhotos",
        containerClient,
        serviceId,
        username
      );
    return beforePhotosResponse;
  } else {
    return null;
  }
};

const processAfterPhotos = async (
  afterPhotos: any[],
  containerClient: ContainerClient,
  serviceId: string,
  username: string
): Promise<CreateServicePhotosResponse[] | null> => {
  if (afterPhotos && afterPhotos.length > 0) {
    const afterPhotosResponse: CreateServicePhotosResponse[] =
      await processPhotos(
        afterPhotos,
        "afterPhotos",
        containerClient,
        serviceId,
        username
      );
    return afterPhotosResponse;
  } else {
    return null;
  }
};

const processPhotos = async (
  photosToBeCreated: any[],
  photoType: string,
  containerClient: ContainerClient,
  serviceId: string,
  username: string
): Promise<CreateServicePhotosResponse[]> => {
  const photosResponse: CreateServicePhotosResponse[] = [];

  for (const photoToBeCreated of photosToBeCreated) {
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

    const photoResponse = new CreateServicePhotosResponse(
      serviceId,
      servicePhotoCreatedDocument.servicePhotoId,
      servicePhotoCreatedDocument.servicePhotoType,
      servicePhotoCreatedDocument.creationDate,
      `${baseUrl}?${servicePhotoCreatedDocument.sasToken}`,
      servicePhotoCreatedDocument.sasTokenExpiresOn
    );

    photosResponse.push(photoResponse);
  }

  return photosResponse;
};
