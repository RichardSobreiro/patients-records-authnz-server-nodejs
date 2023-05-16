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

export const GetPatients = async (
  userId: string,
  patientName?: string,
  startDate?: Date,
  endDate?: Date,
  proceedingTypeId?: string
): Promise<GetPatientsResponse> => {
  let patientDocuments: any[] = [];
  if (startDate || endDate || proceedingTypeId) {
    type Filter = {
      userId: any;
      date?: any;
      proceedingTypeId?: any;
    };
    let filterProceedings: Filter = {
      userId: { userId: userId },
    };
    if (startDate && endDate) {
      filterProceedings.date = { $gte: startDate, $lte: endDate };
    }
    if (proceedingTypeId) {
      filterProceedings.proceedingTypeId = {
        proceedingTypeId: proceedingTypeId,
      };
    }
    const proceedingDocuments = await Proceedings.find(filterProceedings);
    const patientsIds = proceedingDocuments.map((p) => p.patientId);
    patientDocuments = patientDocuments = patientName
      ? await Patients.find({
          userId: userId,
          patientId: { $in: patientsIds },
          patientName: { $regex: patientName, $options: "i" },
        })
      : await Patients.find({
          userId: userId,
          patientId: { $in: patientsIds },
        });
  } else {
    patientDocuments = patientName
      ? await Patients.find({
          userId: userId,
          patientName: { $regex: patientName, $options: "i" },
        })
      : await Patients.find({
          userId: userId,
        });
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
      entity.email
    );
    patients.push(patient);
  });

  return new GetPatientsResponse(patients!.length, patients!);
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
