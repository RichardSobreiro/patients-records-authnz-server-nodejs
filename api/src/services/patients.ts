/** @format */

import { CreatePatientRequest } from "../models/patients/CreatePatientRequest";
import { CreatePatientResponse } from "../models/patients/CreatePatientResponse";
import { Patients } from "../db/models/Patients";
import {
  GetPatient,
  GetPatientsResponse,
} from "../models/patients/GetPatientsResponse";

import { v4 as uuidv4 } from "uuid";
import { Proceedings } from "../db/models/Proceedings";
import { UpdatePatientRequest } from "../models/patients/UpdatePatientRequest";
import { UpdatePatientResponse } from "../models/patients/UpdatePatientResponse";
import { ProceedingPhotos } from "../db/models/ProceedingPhotos";

export const CreatePatient = async (
  request: CreatePatientRequest
): Promise<CreatePatientResponse> => {
  let patientId = uuidv4();

  const result = await Patients.insertMany({
    userId: request.userId,
    patientId: patientId,
    patientName: request.patientName,
    phoneNumber: request.phoneNumber,
    birthDate: request.birthDate,
    creationDate: new Date(),
    email: request.email,
  });

  return new CreatePatientResponse(
    result[0].userId,
    result[0].patientId,
    result[0].patientName,
    result[0].phoneNumber,
    result[0].birthDate,
    result[0].creationDate,
    result[0].email
  );
};

export const UpdatePatient = async (
  request: UpdatePatientRequest
): Promise<UpdatePatientResponse> => {
  const result = await Patients.findOneAndUpdate(
    { userId: request.userId, patientId: request.patientId },
    {
      patientName: request.patientName,
      phoneNumber: request.phoneNumber,
      birthDate: request.birthDate,
      email: request.email,
    }
  );

  return new UpdatePatientResponse(
    result!.userId,
    result!.patientId,
    result!.patientName,
    result!.phoneNumber,
    result!.birthDate,
    result!.creationDate,
    result!.email
  );
};

export const UpdatePatientMostRecentProceedingProperties = async (
  userId: string,
  patientId: string
): Promise<void> => {
  const proceedingDocuments = await Proceedings.find({
    patientId: patientId,
  })
    .sort({ date: -1 })
    .limit(1)
    .exec();

  if (proceedingDocuments.length === 1) {
    const mostRecentProceedingId: string = proceedingDocuments[0].proceedingId;
    const mostRecentProceedingDate: Date = proceedingDocuments[0].date;
    let mostRecentProceedingAfterPhotoUrl: string | null = null;

    const proceedingAfterPhotos = await ProceedingPhotos.find({
      proceedingId: mostRecentProceedingId,
      proceedingPhotoType: "afterPhotos",
    });

    if (proceedingAfterPhotos.length > 0) {
      mostRecentProceedingAfterPhotoUrl = `${proceedingAfterPhotos[0].baseUrl}?${proceedingAfterPhotos[0].sasToken}`;
    }

    const result = await Patients.findOneAndUpdate(
      { userId: userId, patientId: patientId },
      {
        mostRecentProceedingId,
        mostRecentProceedingDate,
        mostRecentProceedingAfterPhotoUrl,
      }
    );
    if (result?.errors) {
    }
  }
};

export const GetPatients = async (
  userId: string,
  pageNumberParam: string,
  patientName?: string,
  startDate?: Date,
  endDate?: Date,
  proceedingTypeId?: string,
  limitParam?: string
): Promise<GetPatientsResponse> => {
  const pageNumber = (parseInt(pageNumberParam) || 1) - 1;
  const limit = (limitParam && parseInt(limitParam)) || 12;

  const totalPatients = await Patients.countDocuments({
    userId: userId,
  }).exec();

  const response = new GetPatientsResponse(userId, totalPatients);

  const startIndex = pageNumber * limit;
  const endIndex = (pageNumber + 1) * limit;

  if (startIndex > 0) {
    response.previous = {
      pageNumber: pageNumber - 1,
      limit: limit,
    };
  }

  if (endIndex < totalPatients) {
    response.next = {
      pageNumber: pageNumber + 1,
      limit: limit,
    };
  }

  let patientDocuments: any[] = [];
  if (startDate || endDate || proceedingTypeId) {
    type Filter = {
      userId: any;
      date?: any;
      proceedingTypeId?: any;
    };
    let filterProceedings: Filter = {
      userId: userId,
    };
    if (startDate && endDate) {
      filterProceedings.date = { $gte: startDate, $lte: endDate };
    }
    if (proceedingTypeId) {
      filterProceedings.proceedingTypeId = proceedingTypeId;
    }
    const proceedingDocuments = await Proceedings.find(filterProceedings);
    const patientsIds = proceedingDocuments.map((p) => p.patientId);
    patientDocuments = patientDocuments = patientName
      ? await Patients.find({
          userId: userId,
          patientId: { $in: patientsIds },
          patientName: { $regex: patientName, $options: "i" },
        })
          .sort({ mostRecentProceedingDate: -1, creationDate: -1 })
          .skip(startIndex)
          .limit(limit)
          .exec()
      : await Patients.find({
          userId: userId,
          patientId: { $in: patientsIds },
        })
          .sort({ mostRecentProceedingDate: -1, creationDate: -1 })
          .skip(startIndex)
          .limit(limit)
          .exec();
  } else {
    patientDocuments = patientName
      ? await Patients.find({
          userId: userId,
          patientName: { $regex: patientName, $options: "i" },
        })
          .sort({ mostRecentProceedingDate: -1, creationDate: -1 })
          .skip(startIndex)
          .limit(limit)
          .exec()
      : await Patients.find({
          userId: userId,
        })
          .sort({ mostRecentProceedingDate: -1, creationDate: -1 })
          .skip(startIndex)
          .limit(limit)
          .exec();
  }

  let patients: GetPatient[] = [];

  patientDocuments.forEach((entity) => {
    const patient: GetPatient = new GetPatient(
      entity.userId,
      entity.patientId,
      entity.patientName,
      entity.phoneNumber,
      entity.birthDate,
      entity.creationDate,
      entity.email,
      entity.mostRecentProceedingId,
      entity.mostRecentProceedingDate,
      entity.mostRecentProceedingAfterPhotoUrl
    );

    patients.push(patient);
  });

  response.patients = patients;

  return response;
};

export const GetPatientById = async (
  userId: string,
  patientId: string
): Promise<GetPatient> => {
  const results = await Patients.findOne({
    userId: userId,
    patientId: patientId,
  });

  const patient: GetPatient = new GetPatient(
    results!.userId,
    results!.patientId,
    results!.patientName,
    results!.phoneNumber,
    results!.birthDate,
    results!.creationDate,
    results!.email
  );

  return patient;
};
