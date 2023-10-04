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
import { ServicesRepository } from "../db/models/ServicesRepository";
import { UpdateCustomerRequest } from "../models/customers/UpdateCustomerRequest";
import { UpdateCustomerResponse } from "../models/customers/UpdateCustomerResponse";
import { AnamneseRepository } from "../db/models/AnamneseRepository";
import { GetCustomerByIdResponse } from "../models/customers/GetCustomerByIdResponse";

export const CreateCustomer = async (
  userEmail: string,
  request: CreateCustomerRequest
): Promise<CreateCustomerResponse> => {
  const customerId = uuidv4();
  const anamneseId = uuidv4();
  let result: any = {};

  const phoneNumberRaw =
    "55" +
    request.phoneNumber
      .replace(/(/g, "")
      .replace(/)/g, "")
      .replace(/-/g, "")
      .replace(/ /g, "");

  try {
    result = await CustomersRepository.insertMany({
      userId: userEmail,
      customerId: customerId,
      customerName: request.customerName,
      birthDate: request.birthDate,
      cpf: request.cpf,
      gender: request.gender,
      maritalStatus: request.maritalStatus,
      ethnicity: request.ethnicity,
      placeOfBirth: request.placeOfBirth,
      occupation: request.occupation,
      phoneNumberRaw: phoneNumberRaw,
      phoneNumber: request.phoneNumber,
      instagramAccount: request.instagramAccount,
      email: request.email,
      cep: request.cep,
      street: request.street,
      number: request.number,
      district: request.district,
      city: request.city,
      complement: request.complement,
      state: request.state,
      creationDate: new Date(),
    });

    const createCustomerResponse = new CreateCustomerResponse(
      result[0].customerId,
      result[0].creationDate,
      result[0].customerName,
      result[0].birthDate,
      result[0].cpf,
      result[0].gender,
      result[0].maritalStatus,
      result[0].ethnicity,
      result[0].placeOfBirth,
      result[0].occupation,
      result[0].phoneNumber,
      result[0].instagramAccount,
      result[0].email,
      result[0].cep,
      result[0].street,
      result[0].number,
      result[0].district,
      result[0].city,
      result[0].complement,
      result[0].state
    );

    return createCustomerResponse;
  } catch (error: any) {
    await CustomersRepository.deleteMany({ customerId: customerId });
    await AnamneseRepository.deleteMany({ anamneseId: anamneseId });
    throw error;
  }
};

export const UpdateCustomer = async (
  userEmail: string,
  request: UpdateCustomerRequest
): Promise<UpdateCustomerResponse> => {
  const phoneNumberRaw =
    "55" +
    request.phoneNumber
      .replace(/(/g, "")
      .replace(/)/g, "")
      .replace(/-/g, "")
      .replace(/ /g, "");

  const result = await CustomersRepository.findOneAndUpdate(
    { userId: userEmail, customerId: request.customerId },
    {
      customerName: request.customerName,
      birthDate: request.birthDate,
      cpf: request.cpf,
      gender: request.gender,
      maritalStatus: request.maritalStatus,
      ethnicity: request.ethnicity,
      placeOfBirth: request.placeOfBirth,
      occupation: request.occupation,
      phoneNumberRaw: phoneNumberRaw,
      phoneNumber: request.phoneNumber,
      instagramAccount: request.instagramAccount,
      email: request.email,
      cep: request.cep,
      street: request.street,
      number: request.number,
      district: request.district,
      city: request.city,
      complement: request.complement,
      state: request.state,
    }
  );

  return new UpdateCustomerResponse(
    result!.customerId,
    result!.creationDate,
    request.customerName,
    request.birthDate,
    request.cpf,
    request.gender,
    request.maritalStatus,
    request.ethnicity,
    request.placeOfBirth,
    request.occupation,
    request.phoneNumber,
    request.instagramAccount,
    request.email,
    request.cep,
    request.street,
    request.number,
    request.district,
    request.city,
    request.complement,
    request.state
  );
};

type Filter = {
  userId: any;
  date?: any;
  serviceTypeId?: any;
};

export const GetCustomers = async (
  userId: string,
  pageNumberParam: string,
  customerName?: string,
  lastServiceStartDate?: Date,
  lastServiceEndDate?: Date,
  serviceTypeIdsParam?: string[],
  limitParam?: string
): Promise<GetCustomersResponse> => {
  const pageNumber = (parseInt(pageNumberParam) || 1) - 1;
  const limit = (limitParam && parseInt(limitParam)) || 12;

  const filter: any = {};
  filter.userId = userId;
  if (customerName && customerName !== "") {
    filter.customerName = { $regex: customerName, $options: "i" };
  }

  const startIndex = pageNumber * limit;
  const endIndex = (pageNumber + 1) * limit;

  let previous: ListPage | undefined = undefined;
  let next: ListPage | undefined = undefined;

  const filterCustomersServices: any = {};
  if (
    (lastServiceStartDate && lastServiceEndDate) ||
    (serviceTypeIdsParam && serviceTypeIdsParam.length > 0)
  ) {
    const customerDocuments = await CustomersRepository.find(filter)
      .sort({ customerName: 1 })
      .exec();

    filterCustomersServices.userId = userId;
    filterCustomersServices.customerId = {
      $in: customerDocuments.map((doc) => doc.customerId),
    };

    const startDateObject = new Date(lastServiceStartDate!);
    const endDateObject = new Date(lastServiceEndDate!);

    let customersServicesDocuments: any = {};

    if (serviceTypeIdsParam && serviceTypeIdsParam.length > 0) {
      filterCustomersServices.serviceTypeIds = {
        $in: Array.isArray(serviceTypeIdsParam)
          ? serviceTypeIdsParam
          : [serviceTypeIdsParam],
      };
    }

    if (lastServiceStartDate && lastServiceEndDate) {
      filterCustomersServices.date = {
        $gte: startDateObject,
        $lte: endDateObject,
      };
    }

    customersServicesDocuments = await ServicesRepository.find(
      filterCustomersServices
    );

    let customers: GetCustomer[] = [];

    customerDocuments.forEach((entity) => {
      const servicesMatchingDateRange = customersServicesDocuments.find(
        (doc) => doc.customerId === entity.customerId
      );
      if (servicesMatchingDateRange) {
        const customer: GetCustomer = new GetCustomer(
          entity.userId,
          entity.customerId,
          entity.customerName,
          entity.phoneNumber,
          entity.birthDate,
          entity.creationDate,
          entity.email
        );

        customers.push(customer);
      }
    });

    customers = customers.slice(startIndex, endIndex);

    const totalCustomers = customers.length;

    if (startIndex > 0) {
      previous = {
        pageNumber: pageNumber - 1,
        limit: limit,
      };
    }

    if (endIndex < totalCustomers) {
      next = {
        pageNumber: pageNumber + 1,
        limit: limit,
      };
    }

    const response = new GetCustomersResponse(
      userId,
      totalCustomers,
      previous,
      next
    );

    response.customers = customers.sort(function (a, b) {
      if (a.customerName < b.customerName) {
        return -1;
      }
      if (a.customerName > b.customerName) {
        return 1;
      }
      return 0;
    });

    return response;
  } else {
    let totalCustomers = await CustomersRepository.countDocuments(
      filter
    ).exec();

    let customerDocuments = await CustomersRepository.find(filter)
      .sort({ customerName: 1 })
      .skip(startIndex)
      .limit(limit)
      .exec();

    if (startIndex > 0) {
      previous = {
        pageNumber: pageNumber - 1,
        limit: limit,
      };
    }

    if (endIndex < totalCustomers) {
      next = {
        pageNumber: pageNumber + 1,
        limit: limit,
      };
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
        entity.birthDate,
        entity.creationDate,
        entity.email
      );

      customers.push(customer);
    });

    response.customers = customers.sort(function (a, b) {
      if (a.customerName < b.customerName) {
        return -1;
      }
      if (a.customerName > b.customerName) {
        return 1;
      }
      return 0;
    });

    return response;
  }
};

export const GetCustomerById = async (
  userId: string,
  customerId: string
): Promise<GetCustomerByIdResponse | undefined> => {
  let customerResponse: GetCustomerByIdResponse | undefined = undefined;

  const customerDocument = await CustomersRepository.findOne({
    userId: userId,
    customerId: customerId,
  });

  customerResponse = new GetCustomerByIdResponse(
    customerDocument!.userId,
    customerDocument!.customerId,
    customerDocument!.creationDate,
    customerDocument!.customerName,
    customerDocument!.birthDate,
    customerDocument!.cpf,
    customerDocument!.gender,
    customerDocument!.maritalStatus,
    customerDocument!.ethnicity,
    customerDocument!.placeOfBirth,
    customerDocument!.occupation,
    customerDocument!.phoneNumber,
    customerDocument!.instagramAccount,
    customerDocument!.email,
    customerDocument!.cep,
    customerDocument!.street,
    customerDocument!.number,
    customerDocument!.district,
    customerDocument!.city,
    customerDocument!.complement,
    customerDocument!.state
  );

  return customerResponse;
};
