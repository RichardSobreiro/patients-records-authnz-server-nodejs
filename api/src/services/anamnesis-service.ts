/** @format */

import { CreateAnamneseRequest } from "../models/customers/CreateAnamneseRequest";
import { CreateAnamneseResponse } from "../models/customers/CreateAnamneseResponse";
import { AnamneseRepository } from "../db/models/AnamneseRepository";
import {
  GetAnamnesis,
  GetAnamnesisResponse,
  ListPage,
} from "../models/customers/GetAnamnesisResponse";
import { GetAnamnesisByIdResponse } from "../models/customers/GetAnamnesisByIdResponse";
import { UpdateAnamnesisRequest } from "../models/customers/UpdateAnamnesisRequest";
import { UpdateAnamnesisResponse } from "../models/customers/UpdateAnamnesisResponse";

import { v4 as uuidv4 } from "uuid";
import { AnamnesisTypeRepository } from "../db/models/AnamnesisTypesRepository";

export const CreateAnamnesis = async (
  userEmail: string,
  request: CreateAnamneseRequest
): Promise<CreateAnamneseResponse> => {
  const anamneseId = uuidv4();
  let anamnesisResponse: CreateAnamneseResponse | undefined = undefined;
  try {
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
    throw error;
  }
};

type Filter = {
  customerId: any;
  date?: any;
  anamnesisTypes?: any;
};

export const GetAnamnesisListAsync = async (
  userId: string,
  pageNumberParam: string,
  customerId: string,
  startDate?: Date,
  endDate?: Date,
  anamnesisType?: string,
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
  if (anamnesisType) {
    filter.type = { $all: [anamnesisType] };
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

  const anamneseTypeIds = [
    ...new Set(
      anamnesisDocument
        .map((document) =>
          document.anamnesisTypesContent.map(
            (anamneseTypeDocument) => anamneseTypeDocument.anamnesisTypeId
          )
        )
        .flat(1)
    ),
  ];

  const anamneseTypeDocuments = await AnamnesisTypeRepository.find({
    anamnesisTypeId: { $in: anamneseTypeIds },
  });

  const anamneseTypesDescriptions = anamneseTypeDocuments.map(
    (entityAnamneseTypeDocument) =>
      entityAnamneseTypeDocument.anamnesisTypeDescription
  );

  if (anamnesisDocument && anamnesisDocument.length == 1) {
    return new GetAnamnesisByIdResponse(
      anamnesisDocument[0].anamneseId,
      anamnesisDocument[0].customerId,
      anamnesisDocument[0].creationDate,
      anamnesisDocument[0].date,
      anamneseTypesDescriptions,
      anamnesisDocument[0].freeTypeText,
      anamnesisDocument[0].gender,
      anamnesisDocument[0].ethnicity,
      anamnesisDocument[0].maritalStatus,
      anamnesisDocument[0].employmentStatus,
      anamnesisDocument[0].comments
    );
  } else {
    throw new Error("Not found");
  }
};

export const UpdateAnamnesis = async (
  userEmail: string,
  request: UpdateAnamnesisRequest
): Promise<UpdateAnamnesisResponse> => {
  try {
    const anamneseDocument = await AnamneseRepository.findOneAndUpdate(
      { customerId: request.customerId, anamneseId: request.anamneseId },
      {
        anamneseId: request.anamneseId,
        customerId: request.customerId,
        date: request.date,
        type: request.type,
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
      request.type,
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
