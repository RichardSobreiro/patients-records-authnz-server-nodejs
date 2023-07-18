/** @format */
import { ServiceTypeRepository } from "../db/models/ServiceTypesRepository";
import { Proceedings } from "../db/models/Proceedings";
import { ProceedingPhotos } from "../db/models/ProceedingPhotos";
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

export const updateProceeding = async (
  userId: string,
  customerId: string,
  serviceId: string,
  request: UpdateServiceRequest,
  files: any
): Promise<UpdateServiceResponse> => {
  const customer = await CustomersRepository.findOne({
    customerId: customerId,
  });

  const proceeding = await Proceedings.findOneAndUpdate(
    { userId: userId, serviceId: serviceId },
    {
      userId: userId,
      serviceId: serviceId,
      creationDate: new Date(),
      customerId: customerId,
      date: new Date(request.date),
      proceedingTypeId: request.serviceTypeId,
      notes: request.notes,
    }
  );

  const response = new UpdateServiceResponse(
    serviceId,
    request!.date,
    request.serviceTypeId,
    request!.notes
  );

  const containerClient = await createContainerClient(customer?.userId!);

  const beforePhotos = files["beforePhotos"];
  const afterPhotos = files["afterPhotos"];

  if (request.beforePhotosCreateNew) {
    const deletedProceedingsPhotos = await ProceedingPhotos.find({
      serviceId: serviceId,
      servicePhotoType: "beforePhotos",
    });
    for (const deletedProceedingPhoto of deletedProceedingsPhotos) {
      await containerClient.deleteBlob(deletedProceedingPhoto.filename);
    }
    await ProceedingPhotos.deleteMany({
      serviceId: serviceId,
      servicePhotoType: "beforePhotos",
    });
  }

  if (beforePhotos && beforePhotos.length > 0) {
    response.beforePhotos = await processBeforePhotos(
      beforePhotos,
      containerClient,
      serviceId,
      customer?.userId!
    );
  }

  if (request.afterPhotosCreateNew) {
    const deletedProceedingsPhotos = await ProceedingPhotos.find({
      serviceId: serviceId,
      servicePhotoType: "afterPhotos",
    });
    for (const deletedProceedingPhoto of deletedProceedingsPhotos) {
      await containerClient.deleteBlob(deletedProceedingPhoto.filename);
    }
    await ProceedingPhotos.deleteMany({
      serviceId: serviceId,
      servicePhotoType: "afterPhotos",
    });
  }

  if (afterPhotos && afterPhotos.length > 0) {
    response.afterPhotos = await processAfterPhotos(
      afterPhotos,
      containerClient,
      serviceId,
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
): Promise<UpdateServicePhotosResponse[] | null> => {
  if (beforePhotos && beforePhotos.length > 0) {
    const beforePhotosResponse: UpdateServicePhotosResponse[] =
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
): Promise<UpdateServicePhotosResponse[] | null> => {
  if (afterPhotos && afterPhotos.length > 0) {
    const afterPhotosResponse: UpdateServicePhotosResponse[] =
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
): Promise<UpdateServicePhotosResponse[]> => {
  const photosResponse: UpdateServicePhotosResponse[] = [];

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

    const photoResponse = new UpdateServicePhotosResponse(
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
