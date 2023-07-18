/** @format */
import { Proceedings } from "../db/models/Proceedings";
import { ProceedingPhotos } from "../db/models/ProceedingPhotos";
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

export const createProceeding = async (
  userId: string,
  customerId: string,
  request: CreateServiceRequest,
  files: any
): Promise<CreateServiceResponse> => {
  const customer = await CustomersRepository.findOne({
    customerId: customerId,
  });

  const proceeding = await Proceedings.create({
    userId: userId,
    serviceId: uuidv4(),
    creationDate: new Date(),
    customerId: customerId,
    date: new Date(request.date),
    proceedingTypeId: request.serviceTypeId,
    notes: request.notes,
  });

  const response = new CreateServiceResponse(
    proceeding.serviceId,
    proceeding.date,
    request.serviceTypeDescription,
    proceeding.notes
  );

  const containerClient = await createContainerClient(customer?.userId!);

  containerClient.createIfNotExists();

  const beforePhotos = files["beforePhotos"];
  if (beforePhotos && beforePhotos.length > 0) {
    response.beforePhotos = await processBeforePhotos(
      beforePhotos,
      containerClient,
      proceeding.serviceId,
      customer?.userId!
    );
  }

  const afterPhotos = files["afterPhotos"];
  if (afterPhotos && afterPhotos.length > 0) {
    response.afterPhotos = await processAfterPhotos(
      afterPhotos,
      containerClient,
      proceeding.serviceId,
      customer?.userId!
    );
  }

  return response;
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

    const proceedingPhotoCreated = await ProceedingPhotos.create({
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
      proceedingPhotoCreated.servicePhotoId,
      proceedingPhotoCreated.servicePhotoType,
      proceedingPhotoCreated.creationDate,
      `${baseUrl}?${proceedingPhotoCreated.sasToken}`,
      proceedingPhotoCreated.sasTokenExpiresOn
    );

    photosResponse.push(photoResponse);
  }

  return photosResponse;
};
