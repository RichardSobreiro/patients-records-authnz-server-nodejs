/** @format */
import { ProceedingTypes, ProceedingType } from "../db/models/ProceedingTypes";
import { Proceedings } from "../db/models/Proceedings";
import { ProceedingPhotos } from "../db/models/ProceedingPhotos";
import { Patients } from "../db/models/Patients";
import { UpdateProceedingRequest } from "../models/patients/proceedings/UpdateProceedingRequest";
import {
  UpdateProceedingPhotosResponse,
  UpdateProceedingResponse,
} from "../models/patients/proceedings/UpdateProceedingResponse";
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
  patientId: string,
  proceedingId: string,
  request: UpdateProceedingRequest,
  files: any
): Promise<UpdateProceedingResponse> => {
  const patient = await Patients.findOne({ patientId: patientId });

  const proceedingType = await createProceedingTypeIfNotExists(
    patient?.userId!,
    request.proceedingTypeDescription
  );

  const proceeding = await Proceedings.findOneAndUpdate(
    { userId: userId, proceedingId: proceedingId },
    {
      userId: userId,
      proceedingId: proceedingId,
      creationDate: new Date(),
      patientId: patientId,
      date: new Date(request.date),
      proceedingTypeId: proceedingType.proceedingTypeId,
      notes: request.notes,
    }
  );

  const response = new UpdateProceedingResponse(
    proceedingId,
    request!.date,
    proceedingType.proceedingTypeDescription,
    request!.notes
  );

  const containerClient = await createContainerClient(patient?.userId!);

  const beforePhotos = files["beforePhotos"];
  const afterPhotos = files["afterPhotos"];

  const deletedProceedingsPhotos = await ProceedingPhotos.find({
    proceedingId: proceedingId,
  });

  for (const deletedProceedingPhoto of deletedProceedingsPhotos) {
    await containerClient.deleteBlob(deletedProceedingPhoto.filename);
  }

  await ProceedingPhotos.deleteMany({
    proceedingId: proceedingId,
  });

  if (beforePhotos && beforePhotos.length > 0) {
    response.beforePhotos = await processBeforePhotos(
      beforePhotos,
      containerClient,
      proceedingId,
      patient?.userId!
    );
  }

  if (afterPhotos && afterPhotos.length > 0) {
    response.afterPhotos = await processAfterPhotos(
      afterPhotos,
      containerClient,
      proceedingId,
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
): Promise<UpdateProceedingPhotosResponse[] | null> => {
  if (beforePhotos && beforePhotos.length > 0) {
    const beforePhotosResponse: UpdateProceedingPhotosResponse[] =
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
): Promise<UpdateProceedingPhotosResponse[] | null> => {
  if (afterPhotos && afterPhotos.length > 0) {
    const afterPhotosResponse: UpdateProceedingPhotosResponse[] =
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
): Promise<UpdateProceedingPhotosResponse[]> => {
  const photosResponse: UpdateProceedingPhotosResponse[] = [];

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

    const photoResponse = new UpdateProceedingPhotosResponse(
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
