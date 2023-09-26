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
      questions: request.questions,
      sections: request.sections,
    });

    anamnesisTypeResponse = new CreateAnamnesisTypeResponse(
      anamnesisTypeId,
      serviceTypeDocument[0].creationDate,
      false,
      serviceTypeDocument[0].anamnesisTypeDescription,
      serviceTypeDocument[0].template,
      serviceTypeDocument[0].questions,
      serviceTypeDocument[0].sections
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
  let anamnesisTypeDocument = await AnamnesisTypeRepository.find({
    userId: userId,
    anamnesisTypeId: anamnesisTypeId,
    isDefault: false,
  });

  if (!anamnesisTypeDocument || anamnesisTypeDocument.length === 0) {
    anamnesisTypeDocument = await AnamnesisTypeRepository.find({
      anamnesisTypeId: anamnesisTypeId,
      isDefault: true,
    });
  }

  if (anamnesisTypeDocument) {
    const response: GetAnamnesisTypeByIdResponse =
      new GetAnamnesisTypeByIdResponse(
        anamnesisTypeDocument[0].anamnesisTypeId,
        anamnesisTypeDocument[0].anamnesisTypeDescription,
        anamnesisTypeDocument[0].template,
        anamnesisTypeDocument[0].isDefault,
        anamnesisTypeDocument[0].questions,
        anamnesisTypeDocument[0].sections
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
          isDefault: false,
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

  const anamnesisTypesDocumentsNoDuplicates = anamnesisTypesDocuments.reduce(
    (curArray, itr) => {
      const userTypeIndex = curArray.findIndex(
        (item) =>
          item.userId === userId &&
          item.anamnesisTypeId === itr.anamnesisTypeId &&
          item.isDefault === false
      );
      const defaultTypeIndex = curArray.findIndex((item) => {
        return (
          item.userId === undefined &&
          item.anamnesisTypeId === itr.anamnesisTypeId &&
          item.isDefault === true
        );
      });
      const itrIsUserType = itr.userId === userId && itr.isDefault === false;

      if (userTypeIndex !== -1 && defaultTypeIndex === -1) {
        return curArray;
      } else if (
        userTypeIndex === -1 &&
        defaultTypeIndex !== -1 &&
        itrIsUserType
      ) {
        curArray[defaultTypeIndex] = itr;
        return curArray;
      }

      curArray.push(itr);
      return curArray;
    },
    []
  );

  response.anamnesisTypes = [];
  for (const anamnesisTypeDocument of anamnesisTypesDocumentsNoDuplicates) {
    const anamnesisType = new GetAnamnesisTypeResponse(
      anamnesisTypeDocument.anamnesisTypeId,
      anamnesisTypeDocument.anamnesisTypeDescription,
      anamnesisTypeDocument.template,
      anamnesisTypeDocument.isDefault,
      anamnesisTypeDocument.questions,
      anamnesisTypeDocument.sections
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
    const existingUserAnamneseType = await AnamnesisTypeRepository.find({
      userId: userId,
      anamnesisTypeId: request.anamnesisTypeId,
      isDefault: false,
    });

    if (existingUserAnamneseType && existingUserAnamneseType.length > 0) {
      await AnamnesisTypeRepository.findOneAndUpdate(
        {
          userId: userId,
          anamnesisTypeId: request.anamnesisTypeId,
          isDefault: false,
        },
        {
          anamnesisTypeDescription: request.anamnesisTypeDescription,
          template: request.template,
          questions: request.questions,
          sections: request.sections,
        }
      );
    } else {
      const serviceTypeDocument = await AnamnesisTypeRepository.insertMany({
        userId: userId,
        anamnesisTypeId: request.anamnesisTypeId,
        anamnesisTypeDescription: request.anamnesisTypeDescription,
        template: request.template,
        isDefault: false,
        creationDate: new Date(),
        questions: request.questions,
        sections: request.sections,
      });
    }
    return new UpdateAnamnesisTypeResponse(
      request.anamnesisTypeId,
      false,
      request.anamnesisTypeDescription,
      request.template,
      request.questions,
      request.sections
    );
  } catch (error: any) {
    throw error;
  }
};
