/** @format */

import { CreateCustomerRequest } from "../models/customers/CreateCustomerRequest";
import { CreateCustomerResponse } from "../models/customers/CreateCustomerResponse";
import { CustomersRepository } from "../db/models/CustomersRepository";
import {
  GetCustomer,
  GetCustomersResponse,
  ListPage,
} from "../models/customers/GetCustomersResponse";

import { v4 as uuidv4 } from "uuid";
import { Proceedings } from "../db/models/Proceedings";
import { UpdateCustomerRequest } from "../models/customers/UpdateCustomerRequest";
import { UpdateCustomerResponse } from "../models/customers/UpdateCustomerResponse";
import { ProceedingPhotos } from "../db/models/ProceedingPhotos";
import { AnamneseRepository } from "../db/models/AnamneseRepository";
import { CreateAnamneseResponse } from "../models/customers/CreateAnamneseResponse";
import { GetCustomerByIdResponse } from "../models/customers/GetCustomerByIdResponse";
import { GetAnamneseByIdResponse } from "../models/customers/GetAnamneseByIdResponse";

export const CreateCustomer = async (
  userEmail: string,
  request: CreateCustomerRequest
): Promise<CreateCustomerResponse> => {
  const customerId = uuidv4();
  const anamneseId = uuidv4();
  let result: any = {};
  try {
    result = await CustomersRepository.insertMany({
      userId: userEmail,
      customerId: customerId,
      customerName: request.customerName,
      phoneNumber: request.phoneNumber,
      creationDate: new Date(),
      email: request.email,
    });

    const anamneseDocument = await AnamneseRepository.insertMany({
      anamneseId: anamneseId,
      customerId: customerId,
      creationDate: new Date(),
      birthDate: request.anamnese.birthDate,
      gender: request.anamnese.gender,
      ethnicity: request.anamnese.ethnicity,
      maritalStatus: request.anamnese.maritalStatus,
      employmentStatus: request.anamnese.employmentStatus,
      comments: request.anamnese.comments,
    });

    const createCustomerResponse = new CreateCustomerResponse(
      result[0].customerId,
      result[0].customerName,
      result[0].phoneNumber,
      result[0].creationDate,
      new CreateAnamneseResponse(
        anamneseId,
        anamneseDocument[0].customerId,
        anamneseDocument[0].creationDate,
        anamneseDocument[0].birthDate,
        anamneseDocument[0].gender,
        anamneseDocument[0].ethnicity,
        anamneseDocument[0].maritalStatus,
        anamneseDocument[0].employmentStatus,
        anamneseDocument[0].comments
      ),
      result[0].email
    );

    return createCustomerResponse;
  } catch (error: any) {
    await CustomersRepository.deleteMany({ customerId: customerId });
    await AnamneseRepository.deleteMany({ anamneseId: anamneseId });
    throw error;
  }
};

export const UpdateCustomer = async (
  request: UpdateCustomerRequest
): Promise<UpdateCustomerResponse> => {
  const result = await CustomersRepository.findOneAndUpdate(
    { userId: request.userId, customerId: request.customerId },
    {
      customerName: request.customerName,
      phoneNumber: request.phoneNumber,
      birthDate: request.birthDate,
      email: request.email,
    }
  );

  return new UpdateCustomerResponse(
    result!.userId,
    result!.customerId,
    result!.customerName,
    result!.phoneNumber,
    result!.birthDate,
    result!.creationDate,
    result!.email
  );
};

export const UpdateCustomerMostRecentProceedingProperties = async (
  userId: string,
  customerId: string
): Promise<void> => {
  const proceedingDocuments = await Proceedings.find({
    customerId: customerId,
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

    const result = await CustomersRepository.findOneAndUpdate(
      { userId: userId, customerId: customerId },
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

type Filter = {
  userId: any;
  date?: any;
  proceedingTypeId?: any;
};

export const GetCustomers = async (
  userId: string,
  pageNumberParam: string,
  customerName?: string,
  startDate?: Date,
  endDate?: Date,
  proceedingTypeId?: string,
  limitParam?: string
): Promise<GetCustomersResponse> => {
  const pageNumber = (parseInt(pageNumberParam) || 1) - 1;
  const limit = (limitParam && parseInt(limitParam)) || 12;

  const startIndex = pageNumber * limit;
  const endIndex = (pageNumber + 1) * limit;

  let totalCustomers = 0;
  let previous: ListPage | undefined = undefined;
  let next: ListPage | undefined = undefined;

  if (startIndex > 0) {
    previous = {
      pageNumber: pageNumber - 1,
      limit: limit,
    };
  }

  let customerDocuments: any[] = [];
  if (startDate || endDate || proceedingTypeId) {
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
    const customersIds = proceedingDocuments.map((p) => p.customerId);

    totalCustomers = customerName
      ? await CustomersRepository.countDocuments({
          userId: userId,
          customerId: { $in: customersIds },
          customerName: { $regex: customerName, $options: "i" },
        }).exec()
      : await CustomersRepository.countDocuments({
          userId: userId,
          customerId: { $in: customersIds },
        }).exec();

    if (endIndex < totalCustomers) {
      next = {
        pageNumber: pageNumber + 1,
        limit: limit,
      };
    }

    customerDocuments = customerName
      ? await CustomersRepository.find({
          userId: userId,
          customerId: { $in: customersIds },
          customerName: { $regex: customerName, $options: "i" },
        })
          .sort({ mostRecentProceedingDate: -1, creationDate: -1 })
          .skip(startIndex)
          .limit(limit)
          .exec()
      : await CustomersRepository.find({
          userId: userId,
          customerId: { $in: customersIds },
        })
          .sort({ mostRecentProceedingDate: -1, creationDate: -1 })
          .skip(startIndex)
          .limit(limit)
          .exec();
  } else {
    if (customerName) {
      totalCustomers = await CustomersRepository.countDocuments({
        userId: userId,
        customerName: { $regex: customerName, $options: "i" },
      }).exec();

      if (endIndex < totalCustomers) {
        next = {
          pageNumber: pageNumber + 1,
          limit: limit,
        };
      }

      customerDocuments = await CustomersRepository.find({
        userId: userId,
        customerName: { $regex: customerName, $options: "i" },
      })
        .sort({ mostRecentProceedingDate: -1, creationDate: -1 })
        .skip(startIndex)
        .limit(limit)
        .exec();
    } else {
      totalCustomers = await CustomersRepository.countDocuments({
        userId: userId,
      }).exec();

      if (endIndex < totalCustomers) {
        next = {
          pageNumber: pageNumber + 1,
          limit: limit,
        };
      }

      customerDocuments = await CustomersRepository.find({
        userId: userId,
      })
        .sort({ mostRecentProceedingDate: -1, creationDate: -1 })
        .skip(startIndex)
        .limit(limit)
        .exec();
    }
  }

  const response = new GetCustomersResponse(
    userId,
    totalCustomers,
    previous,
    next
  );

  let customers: GetCustomer[] = [];

  customerDocuments.forEach((entity) => {
    const customer: GetCustomer = new GetCustomer(
      entity.userId,
      entity.customerId,
      entity.customerName,
      entity.phoneNumber,
      entity.creationDate,
      entity.email,
      entity.mostRecentProceedingId,
      entity.mostRecentProceedingDate,
      entity.mostRecentProceedingAfterPhotoUrl
    );

    customers.push(customer);
  });

  response.customers = customers;

  return response;
};

export const GetCustomerById = async (
  userId: string,
  customerId: string
): Promise<GetCustomerByIdResponse | undefined> => {
  let customerResponse: GetCustomerByIdResponse | undefined = undefined;
  let anamnesesResponse: GetAnamneseByIdResponse[] | undefined = undefined;

  const anamnesesDocument = await AnamneseRepository.find({
    customerId: customerId,
  });

  if (anamnesesDocument && anamnesesDocument.length > 0) {
    anamnesesResponse = [];
    anamnesesDocument.forEach((document) => {
      const anamnese = new GetAnamneseByIdResponse(
        document.anamneseId,
        document.customerId,
        document.creationDate,
        document.birthDate,
        document.gender,
        document.ethnicity,
        document.maritalStatus,
        document.employmentStatus,
        document.comments
      );
      anamnesesResponse?.push(anamnese);
    });
  }

  const customerDocument = await CustomersRepository.findOne({
    userId: userId,
    customerId: customerId,
  });

  customerResponse = new GetCustomerByIdResponse(
    customerDocument!.userId,
    customerDocument!.customerId,
    customerDocument!.customerName,
    customerDocument!.phoneNumber,
    customerDocument!.creationDate,
    anamnesesResponse,
    customerDocument!.email
  );

  return customerResponse;
};
