/** @format */

import {
  CreateAnamneseRequest,
  CreateAnamnesisTypeFileRequest,
} from "../models/customers/CreateAnamneseRequest";
import { CreateAnamneseResponse } from "../models/customers/CreateAnamneseResponse";
import { Anamnese, AnamneseRepository } from "../db/models/AnamneseRepository";
import {
  GetAnamnesis,
  GetAnamnesisResponse,
  ListPage,
} from "../models/customers/GetAnamnesisResponse";
import { GetAnamnesisByIdResponse } from "../models/customers/GetAnamnesisByIdResponse";
import {
  UpdateAnamnesisRequest,
  UpdateAnamnesisTypeFileRequest,
} from "../models/customers/UpdateAnamnesisRequest";
import { UpdateAnamnesisResponse } from "../models/customers/UpdateAnamnesisResponse";

import { v4 as uuidv4 } from "uuid";
import { AnamnesisTypeRepository } from "../db/models/AnamnesisTypesRepository";
import {
  createBlobClient,
  createBlobSas,
  createContainerClient,
  getBaseBlobURL,
} from "./azure/azure.storage.account";

export const CreateAnamnesis = async (
  userEmail: string,
  request: CreateAnamneseRequest,
  files?: any
): Promise<CreateAnamneseResponse> => {
  const anamneseId = uuidv4();
  let anamnesisResponse: CreateAnamneseResponse | undefined = undefined;
  let filesRequests: CreateAnamnesisTypeFileRequest[] | undefined = undefined;
  const containerClient = await createContainerClient(userEmail);
  containerClient.createIfNotExists();

  try {
    if (files && files["files"] && files["files"].length > 0) {
      filesRequests = await uploadFilesToStorageProvider(
        files,
        userEmail,
        containerClient
      );
    }

    request.anamnesisTypesContent.forEach((typeContent) => {
      if (typeContent.anamnesisTypeDescription === "Arquivo") {
        typeContent.files = filesRequests;
      }
    });

    const anamneseDocument = await AnamneseRepository.insertMany({
      anamneseId: anamneseId,
      customerId: request.customerId,
      creationDate: new Date(),
      date: request.date,
      anamnesisTypesContent: request.anamnesisTypesContent,
      freeTypeText: request.freeTypeText,
      gender: request.gender,
      ethnicity: request.ethnicity,
      maritalStatus: request.maritalStatus,
      employmentStatus: request.employmentStatus,
      comments: request.comments,
    });

    anamnesisResponse = new CreateAnamneseResponse(
      anamneseId,
      anamneseDocument[0].customerId,
      anamneseDocument[0].creationDate,
      anamneseDocument[0].date,
      anamneseDocument[0].anamnesisTypesContent,
      anamneseDocument[0].freeTypeText,
      anamneseDocument[0].gender,
      anamneseDocument[0].ethnicity,
      anamneseDocument[0].maritalStatus,
      anamneseDocument[0].employmentStatus,
      anamneseDocument[0].comments
    );

    return anamnesisResponse;
  } catch (error: any) {
    await AnamneseRepository.deleteMany({ anamneseId: anamneseId });
    if (filesRequests && filesRequests.length > 0) {
      for (const fileRequest of filesRequests)
        await containerClient.deleteBlob(fileRequest.filename);
    }
    throw error;
  }
};

export const GetAnamnesisListAsync = async (
  userId: string,
  pageNumberParam: string,
  customerId: string,
  startDate?: Date,
  endDate?: Date,
  anamnesisTypeIds?: string[],
  anamnesisTypeDescription?: string,
  limitParam?: string
): Promise<GetAnamnesisResponse> => {
  const pageNumber = (parseInt(pageNumberParam) || 1) - 1;
  const limit = (limitParam && parseInt(limitParam)) || 12;

  const filter: any = {};
  filter.userId = userId;
  filter.customerId = customerId;
  if (startDate && endDate) {
    filter.date = { $gte: startDate, $lte: endDate };
  }
  if (anamnesisTypeIds) {
    filter.anamnesisTypesContent = {
      $elemMatch: {
        anamnesisTypeId: {
          $in: Array.isArray(anamnesisTypeIds)
            ? anamnesisTypeIds
            : [anamnesisTypeIds],
        },
      },
    };
  }

  if (anamnesisTypeDescription) {
    if (filter.anamnesisTypesContent) {
      filter.anamnesisTypesContent = {
        ...filter.anamnesisTypesContent,
        $elemMatch: {
          anamnesisTypeDescription: {
            $regex: anamnesisTypeDescription,
            $options: "i",
          },
        },
      };
    } else {
      filter.anamnesisTypesContent = {
        $elemMatch: {
          anamnesisTypeDescription: {
            $regex: anamnesisTypeDescription,
            $options: "i",
          },
        },
      };
    }
  }

  const startIndex = pageNumber * limit;
  const endIndex = (pageNumber + 1) * limit;

  const anamnesisDocuments = await AnamneseRepository.find(filter)
    .sort({ date: "desc" })
    .skip(startIndex)
    .limit(limit)
    .exec();

  const anamnesisCount = await AnamneseRepository.countDocuments(filter).exec();

  let previous: ListPage | undefined = undefined;
  let next: ListPage | undefined = undefined;

  if (startIndex > 0) {
    previous = {
      pageNumber: pageNumber - 1,
      limit: limit,
    };
  }

  if (endIndex < anamnesisCount) {
    next = {
      pageNumber: pageNumber + 1,
      limit: limit,
    };
  }

  const response = new GetAnamnesisResponse(
    userId,
    customerId,
    anamnesisCount,
    previous,
    next
  );

  const anamneseTypeIds = [
    ...new Set(
      anamnesisDocuments
        .map((document) =>
          document.anamnesisTypesContent.map((type) => type.anamnesisTypeId)
        )
        .flat(1)
    ),
  ];

  const anamneseTypeDocuments = await AnamnesisTypeRepository.find({
    anamnesisTypeId: { $in: anamneseTypeIds },
  });

  let anamnesis: GetAnamnesis[] = [];

  anamnesisDocuments.forEach((entity) => {
    const entityAnamneseTypeIds = [
      ...new Set(
        entity.anamnesisTypesContent.map((type) => type.anamnesisTypeId).flat(1)
      ),
    ];

    const entityAnamneseTypeDocuments = anamneseTypeDocuments.filter(
      (anamneseTypeDocument) =>
        entityAnamneseTypeIds.includes(anamneseTypeDocument.anamnesisTypeId)
    );

    const anamneseTypesDescriptions = entityAnamneseTypeDocuments.map(
      (entityAnamneseTypeDocument) =>
        entityAnamneseTypeDocument.anamnesisTypeDescription
    );

    const customer: GetAnamnesis = new GetAnamnesis(
      entity.anamneseId,
      entity.customerId,
      entity.creationDate,
      entity.date,
      anamneseTypesDescriptions
    );

    anamnesis.push(customer);
  });

  response.anamnesis = anamnesis;

  return response;
};

export const GetAnamnesisById = async (
  userEmail: string,
  customerId: string,
  anamneseId: string
): Promise<GetAnamnesisByIdResponse> => {
  const anamnesisDocument = await AnamneseRepository.find({
    customerId: customerId,
    anamneseId: anamneseId,
  });

  if (anamnesisDocument && anamnesisDocument.length == 1) {
    const response = new GetAnamnesisByIdResponse(
      anamnesisDocument[0].anamneseId,
      anamnesisDocument[0].customerId,
      anamnesisDocument[0].creationDate,
      anamnesisDocument[0].date,
      anamnesisDocument[0].anamnesisTypesContent,
      anamnesisDocument[0].freeTypeText,
      anamnesisDocument[0].gender,
      anamnesisDocument[0].ethnicity,
      anamnesisDocument[0].maritalStatus,
      anamnesisDocument[0].employmentStatus,
      anamnesisDocument[0].comments
    );

    const thresholdDateTime = new Date();
    thresholdDateTime.setHours(thresholdDateTime.getHours() - 1);

    const anamnesisTypeFileContent = response.anamnesisTypesContent.find(
      (typeContent) => typeContent.anamnesisTypeDescription === "Arquivo"
    );

    if (anamnesisTypeFileContent && anamnesisTypeFileContent.files) {
      for (const file of anamnesisTypeFileContent.files) {
        if (
          file.sasTokenExpiresOn ||
          (file.sasTokenExpiresOn !== undefined &&
            (file.sasTokenExpiresOn as Date) < thresholdDateTime)
        ) {
          const sasToken = await createBlobSas(userEmail, file.filename);
          file.sasToken = sasToken.sasToken;
          file.sasTokenExpiresOn = sasToken.expiresOn!;
          await AnamneseRepository.findOneAndUpdate(
            {
              customerId: customerId,
              anamneseId: anamneseId,
              "anamnesisTypesContent.files.fileId": file.fileId,
            },
            {
              $set: {
                "anamnesisTypesContent.$[].files.$[].sasToken":
                  sasToken.sasToken,
                "anamnesisTypesContent.$[].files.$[].sasTokenExpiresOn":
                  sasToken.expiresOn,
              },
            }
          );
        }
      }
    }

    return response;
  } else {
    throw new Error("Not found");
  }
};

export const UpdateAnamnesis = async (
  userEmail: string,
  request: UpdateAnamnesisRequest,
  filesFromClient?: any
): Promise<UpdateAnamnesisResponse> => {
  let updatedFilesRequests: UpdateAnamnesisTypeFileRequest[] | undefined =
    undefined;
  const containerClient = await createContainerClient(userEmail);
  containerClient.createIfNotExists();
  try {
    const oldAnamnesisDocument = await AnamneseRepository.find({
      customerId: request.customerId,
      anamneseId: request.anamneseId,
    });

    let existingAnamnese =
      oldAnamnesisDocument[0].toObject() as unknown as Anamnese;

    const existingAnamnesisTypeFileContent =
      existingAnamnese.anamnesisTypesContent.find(
        (typeContent) => typeContent.anamnesisTypeDescription === "Arquivo"
      );

    const existingFiles = existingAnamnesisTypeFileContent?.files;

    if (request.existingFilesIds && !Array.isArray(request.existingFilesIds)) {
      request.existingFilesIds = [request.existingFilesIds];
    }

    if (filesFromClient && filesFromClient.length > 0) {
      updatedFilesRequests = [];

      for (const fileFromClient of filesFromClient) {
        const existingFileDocumentId = request.existingFilesIds?.find(
          (existingFileId) => existingFileId === fileFromClient.fileId
        );
        if (!existingFileDocumentId) {
          const createdFile = await uploadFileToStorageProvider(
            fileFromClient,
            userEmail,
            containerClient
          );
          updatedFilesRequests.push(createdFile);
        } else {
          const existingFileDocument = existingFiles?.find(
            (f) => f.fileId === existingFileDocumentId
          );
          const existingFileResponse =
            existingFileDocument as UpdateAnamnesisTypeFileRequest;
          updatedFilesRequests.push(existingFileResponse);
        }
      }
      if (existingFiles) {
        for (const existingFile of existingFiles) {
          const deletedFile = request.existingFilesIds?.find(
            (existingFileId) => existingFileId === existingFile.fileId
          );
          if (!deletedFile) {
            await containerClient.deleteBlob(existingFile.filename);
          } else {
            const existingFileResponse =
              existingFile as UpdateAnamnesisTypeFileRequest;
            updatedFilesRequests.push(existingFileResponse);
          }
        }
      }
    } else if (
      (!filesFromClient || filesFromClient.length === 0) &&
      existingFiles
    ) {
      for (const existingFile of existingFiles) {
        const deletedFile = request.existingFilesIds?.find(
          (existingFileId) => existingFileId === existingFile.fileId
        );
        if (!deletedFile) {
          await containerClient.deleteBlob(existingFile.filename);
        } else {
          if (!updatedFilesRequests) {
            updatedFilesRequests = [];
          }
          const existingFileResponse =
            existingFile as UpdateAnamnesisTypeFileRequest;
          updatedFilesRequests.push(existingFileResponse);
        }
      }
    }

    request.anamnesisTypesContent.forEach((typeContent) => {
      if (typeContent.anamnesisTypeDescription === "Arquivo") {
        typeContent.files = updatedFilesRequests;
      }
    });

    await AnamneseRepository.findOneAndUpdate(
      { customerId: request.customerId, anamneseId: request.anamneseId },
      {
        anamneseId: request.anamneseId,
        customerId: request.customerId,
        date: request.date,
        anamnesisTypesContent: request.anamnesisTypesContent,
        freeTypeText: request.freeTypeText,
        gender: request.gender,
        ethnicity: request.ethnicity,
        maritalStatus: request.maritalStatus,
        employmentStatus: request.employmentStatus,
        comments: request.comments,
      }
    );

    return new UpdateAnamnesisResponse(
      request.anamneseId,
      request.customerId,
      request.date,
      request.anamnesisTypesContent,
      request.freeTypeText,
      request.gender,
      request.ethnicity,
      request.maritalStatus,
      request.employmentStatus,
      request.comments
    );
  } catch (error: any) {
    throw error;
  }
};

const uploadFilesToStorageProvider = async (
  files: any[],
  userEmail: string,
  containerClient: any
) => {
  const filesRequests: CreateAnamnesisTypeFileRequest[] = [];
  const filesFromAnamenesisType = files["files"];
  for (const file of filesFromAnamenesisType) {
    const newFile = await uploadFileToStorageProvider(
      file,
      userEmail,
      containerClient
    );
    filesRequests.push(newFile);
  }
  return filesRequests;
};

const uploadFileToStorageProvider = async (
  file: any,
  userEmail: string,
  containerClient: any
) => {
  const fileType = file.mimetype.slice(file.mimetype.indexOf("/") + 1);
  const fileId = uuidv4();
  const filename = `${fileId}.${fileType}`;
  const originalFileName = file.originalname;
  const baseUrl = getBaseBlobURL(userEmail, filename);

  const blobClient = await createBlobClient(containerClient, filename);

  const options = {
    blobHTTPHeaders: {
      blobContentType: file.mimetype,
      blobContentEncoding: file.encoding,
    },
  };

  await blobClient.uploadData(file.buffer, options);

  const sasToken = await createBlobSas(userEmail, filename);

  const newFile = new CreateAnamnesisTypeFileRequest(
    fileId,
    new Date(),
    file.mimetype,
    fileType,
    file.encoding,
    filename,
    originalFileName,
    baseUrl,
    sasToken.sasToken,
    sasToken.expiresOn
  );

  return newFile;
};
