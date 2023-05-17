/** @format */
import { ProceedingTypes, ProceedingType } from "../db/models/ProceedingTypes";
import { Proceedings } from "../db/models/Proceedings";
import { ProceedingPhotos } from "../db/models/ProceedingPhotos";
import { Patients } from "../db/models/Patients";
import { CreateProceedingRequest } from "../models/patients/proceedings/CreateProceedingRequest";
import {
  CreateProceedingPhotosResponse,
  CreateProceedingResponse,
} from "../models/patients/proceedings/CreateProceedingResponse";
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
  patientId: string,
  request: CreateProceedingRequest,
  files: any
): Promise<CreateProceedingResponse> => {
  const patient = await Patients.findOne({ patientId: patientId });

  const proceedingType = await createProceedingTypeIfNotExists(
    patient?.userId!,
    request.proceedingTypeDescription
  );

  const proceeding = await Proceedings.create({
    userId: userId,
    proceedingId: uuidv4(),
    creationDate: new Date(),
    patientId: patientId,
    date: new Date(request.date),
    proceedingTypeId: proceedingType.proceedingTypeId,
    notes: request.notes,
  });

  const response = new CreateProceedingResponse(
    proceeding.proceedingId,
    proceeding.date,
    proceedingType.proceedingTypeDescription,
    proceeding.notes
  );

  const containerClient = await createContainerClient(patient?.userId!);

  containerClient.createIfNotExists();

  const beforePhotos = files["beforePhotos"];
  if (beforePhotos && beforePhotos.length > 0) {
    response.beforePhotos = await processBeforePhotos(
      beforePhotos,
      containerClient,
      proceeding.proceedingId,
      patient?.userId!
    );
  }

  const afterPhotos = files["afterPhotos"];
  if (afterPhotos && afterPhotos.length > 0) {
    response.afterPhotos = await processAfterPhotos(
      afterPhotos,
      containerClient,
      proceeding.proceedingId,
      patient?.userId!
    );
  }

  return response;
};

const processBeforePhotos = async (
  beforePhotos: any[],
  containerClient: ContainerClient,
  proceedingId: string,
  username: string
): Promise<CreateProceedingPhotosResponse[] | null> => {
  if (beforePhotos && beforePhotos.length > 0) {
    const beforePhotosResponse: CreateProceedingPhotosResponse[] =
      await processPhotos(
        beforePhotos,
        "beforePhotos",
        containerClient,
        proceedingId,
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
  proceedingId: string,
  username: string
): Promise<CreateProceedingPhotosResponse[] | null> => {
  if (afterPhotos && afterPhotos.length > 0) {
    const afterPhotosResponse: CreateProceedingPhotosResponse[] =
      await processPhotos(
        afterPhotos,
        "afterPhotos",
        containerClient,
        proceedingId,
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
  proceedingId: string,
  username: string
): Promise<CreateProceedingPhotosResponse[]> => {
  const photosResponse: CreateProceedingPhotosResponse[] = [];

  for (const photoToBeCreated of photosToBeCreated) {
    const imageType = photoToBeCreated.mimetype.slice(
      photoToBeCreated.mimetype.indexOf("/") + 1
    );
    const proceedingPhotoId = uuidv4();
    const filename = `${proceedingPhotoId}.${imageType}`;
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
      proceedingId: proceedingId,
      creationDate: new Date(),
      proceedingPhotoId: proceedingPhotoId,
      proceedingPhotoType: photoType,
      mimeType: photoToBeCreated.mimetype,
      imageType: imageType,
      contentEncoding: photoToBeCreated.encoding,
      filename: filename,
      baseUrl: baseUrl,
      sasToken: sasToken.sasToken,
      sasTokenExpiresOn: sasToken.expiresOn,
    });

    const photoResponse = new CreateProceedingPhotosResponse(
      proceedingId,
      proceedingPhotoCreated.proceedingPhotoId,
      proceedingPhotoCreated.proceedingPhotoType,
      proceedingPhotoCreated.creationDate,
      `${baseUrl}?${proceedingPhotoCreated.sasToken}`,
      proceedingPhotoCreated.sasTokenExpiresOn
    );

    photosResponse.push(photoResponse);
  }

  return photosResponse;
};

const createProceedingTypeIfNotExists = async (
  userId: string,
  proceedingTypeDescription: string
): Promise<ProceedingType> => {
  let proceedingType: ProceedingType | null = await ProceedingTypes.findOne({
    proceedingTypeDescription: {
      $regex: proceedingTypeDescription,
      $options: "i",
    },
  });

  if (!proceedingType) {
    proceedingType = await ProceedingTypes.create({
      userId: userId,
      creationDate: new Date(),
      proceedingTypeId: uuidv4(),
      proceedingTypeDescription: proceedingTypeDescription,
      notes: null,
    });
  }
  return proceedingType;
};
