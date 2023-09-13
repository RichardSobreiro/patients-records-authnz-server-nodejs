/** @format */
import { v4 as uuidv4 } from "uuid";
import { CreateAnamnesisTypeRequest } from "../models/customers/anamnesis/anamnesis-types/CreateAnamnesisTypeRequest";
import { CreateAnamnesisTypeResponse } from "../models/customers/anamnesis/anamnesis-types/CreateAnamnesisTypeResponse";
import { AnamnesisTypeRepository } from "../db/models/AnamnesisTypesRepository";
import {
  GetAnamnesisTypeResponse,
  GetAnamnesisTypesResponse,
} from "../models/customers/anamnesis/anamnesis-types/GetAnamnesisTypesResponse";
import { UpdateAnamnesisTypeResponse } from "../models/customers/anamnesis/anamnesis-types/UpdateAnamnesisTypeResponse";
import { UpdateAnamnesisTypeRequest } from "../models/customers/anamnesis/anamnesis-types/UpdateAnamnesisTypeRequest";
import { GetAnamnesisTypeByIdResponse } from "../models/customers/anamnesis/anamnesis-types/GetAnamnesisTypeByIdResponse";

export const CreateAnamnesisType = async (
  userId: string,
  request: CreateAnamnesisTypeRequest
): Promise<CreateAnamnesisTypeResponse> => {
  const anamnesisTypeId = uuidv4();
  let anamnesisTypeResponse: CreateAnamnesisTypeResponse | undefined =
    undefined;
  try {
    const serviceTypeDocument = await AnamnesisTypeRepository.insertMany({
      userId: userId,
      anamnesisTypeId: anamnesisTypeId,
      anamnesisTypeDescription: request.anamnesisTypeDescription,
      template: request.template,
      isDefault: false,
      creationDate: new Date(),
    });

    anamnesisTypeResponse = new CreateAnamnesisTypeResponse(
      anamnesisTypeId,
      serviceTypeDocument[0].creationDate,
      false,
      serviceTypeDocument[0].anamnesisTypeDescription,
      serviceTypeDocument[0].template
    );

    return anamnesisTypeResponse;
  } catch (error: any) {
    await AnamnesisTypeRepository.deleteMany({
      anamnesisTypeId: anamnesisTypeId,
    });
    throw error;
  }
};

export const GetAnamnesisTypeById = async (
  userId: string,
  anamnesisTypeId: string
): Promise<GetAnamnesisTypeByIdResponse | null> => {
  const anamnesisTypeDocument = await AnamnesisTypeRepository.find({
    userId: userId,
    anamnesisTypeId: anamnesisTypeId,
  });

  if (anamnesisTypeDocument) {
    const response: GetAnamnesisTypeByIdResponse =
      new GetAnamnesisTypeByIdResponse(
        anamnesisTypeDocument[0].anamnesisTypeId,
        anamnesisTypeDocument[0].anamnesisTypeDescription,
        anamnesisTypeDocument[0].template,
        anamnesisTypeDocument[0].isDefault,
        anamnesisTypeDocument[0].questions
      );
    return response;
  } else {
    return null;
  }
};

export const GetAnamnesisTypes = async (
  userId: string,
  anamnesisTypeDescription?: string
): Promise<GetAnamnesisTypesResponse> => {
  let anamnesisTypesDocuments: any = [];

  if (anamnesisTypeDescription) {
    anamnesisTypesDocuments = await AnamnesisTypeRepository.find({
      $or: [
        {
          userId: userId,
          anamnesisTypeDescription: {
            $regex: anamnesisTypeDescription,
            $options: "i",
          },
        },
        {
          isDefault: true,
          anamnesisTypeDescription: {
            $regex: anamnesisTypeDescription,
            $options: "i",
          },
        },
      ],
    });
  } else {
    anamnesisTypesDocuments = await AnamnesisTypeRepository.find({
      $or: [{ userId: userId }, { isDefault: true }],
    });
  }

  const response: GetAnamnesisTypesResponse = new GetAnamnesisTypesResponse(
    userId
  );

  response.anamnesisTypes = [];
  for (const anamnesisTypeDocument of anamnesisTypesDocuments) {
    const anamnesisType = new GetAnamnesisTypeResponse(
      anamnesisTypeDocument.anamnesisTypeId,
      anamnesisTypeDocument.anamnesisTypeDescription,
      anamnesisTypeDocument.template,
      anamnesisTypeDocument.isDefault,
      anamnesisTypeDocument.questions
    );
    response.anamnesisTypes?.push(anamnesisType);
  }

  return response;
};

export const UpdateAnamnesisType = async (
  userId: string,
  request: UpdateAnamnesisTypeRequest
): Promise<UpdateAnamnesisTypeResponse> => {
  try {
    await AnamnesisTypeRepository.findOneAndUpdate(
      {
        userId: userId,
        anamnesisTypeId: request.anamnesisTypeId,
        isDefault: false,
      },
      {
        anamnesisTypeDescription: request.anamnesisTypeDescription,
        template: request.template,
      }
    );

    return new UpdateAnamnesisTypeResponse(
      request.anamnesisTypeId,
      false,
      request.anamnesisTypeDescription,
      request.template
    );
  } catch (error: any) {
    throw error;
  }
};
