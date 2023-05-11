/** @format */

import { CreatePatientRequest } from "../models/patients/CreatePatientRequest";
import { CreatePatientResponse } from "../models/patients/CreatePatientResponse";
import { Patients } from "../db/models/Patients";
import {
  GetPatient,
  GetPatientsResponse,
} from "../models/patients/GetPatientsResponse";

import { v4 as uuidv4 } from "uuid";

export const CreatePatient = async (
  request: CreatePatientRequest
): Promise<CreatePatientResponse> => {
  let patientId = uuidv4();

  const result = await Patients.insertMany({
    username: request.username,
    patientId: patientId,
    patientName: request.patientName,
    phoneNumber: request.phoneNumber,
    birthDate: request.birthDate,
    creationDate: new Date(),
    email: request.email,
  });

  return new CreatePatientResponse(
    result[0].username,
    result[0].patientId,
    result[0].patientName,
    result[0].phoneNumber,
    result[0].birthDate,
    result[0].creationDate,
    result[0].email
  );
};

export const GetPatients = async (
  patientName?: string
): Promise<GetPatientsResponse> => {
  const results = patientName
    ? await Patients.find({
        patientName: { $regex: patientName, $options: "i" },
      })
    : await Patients.find();
  let patients: GetPatient[] = [];

  results.forEach((entity) => {
    const patient: GetPatient = new GetPatient(
      entity.username,
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
  patientId: string
): Promise<GetPatient> => {
  const results = await Patients.findOne({ patientId: patientId });

  const patient: GetPatient = new GetPatient(
    results!.username,
    results!.patientId,
    results!.patientName,
    results!.phoneNumber,
    results!.birthDate,
    results!.creationDate,
    results!.email
  );

  return patient;
};
