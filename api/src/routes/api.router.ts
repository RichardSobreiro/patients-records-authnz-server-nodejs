/** @format */

import Router from "koa-router";
import multer from "@koa/multer";
import customersController from "../controllers/customers.controller";
import servicesController from "../controllers/services.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import anamnesisController from "../controllers/anamnesis.controller";
import serviceTypesController from "../controllers/service-types.controller";
import anamnesisTypesController from "../controllers/anamnesis-types.controller";
import whatsappController from "../controllers/whatsapp.controller";

const upload = multer();

export default () => {
  const router = new Router();

  const { pi, createCustomer, getCustomers, getCustomerById, updateCustomer } =
    customersController();

  const {
    createAnamnesisType,
    getAnamnesisTypeById,
    getAnamnesisTypeList,
    updateAnamnesisType,
  } = anamnesisTypesController();

  const {
    createAnamnesis,
    updateAnamnesis,
    getAnamnesisById,
    getAnamnesisList,
  } = anamnesisController();

  const {
    createServiceType,
    getServiceTypeById,
    updateServiceType,
    getServiceTypeList,
  } = serviceTypesController();

  const {
    createService,
    getServiceById,
    getServices,
    updateService,
    getServicesAgenda,
  } = servicesController();

  const {
    whatsappVerify,
    webHookEventNotification,
    sendAppointmentReminderMessage,
  } = whatsappController();

  //------------------------------------------------------------------------------------------------------
  // Whatsapp
  router.get("/webhooks/whatsapp", whatsappVerify);
  router.post("/webhooks/whatsapp", webHookEventNotification);
  router.post(
    "/messages/appointments/whatsapp",
    authenticate,
    sendAppointmentReminderMessage
  );
  //------------------------------------------------------------------------------------------------------
  // Customers
  router.get("/pi", authenticate, authorize("api:read"), pi);
  router.post("/customers", authenticate, createCustomer);
  router.put("/customers/:customerId", authenticate, updateCustomer);
  router.get("/customers", authenticate, getCustomers);
  router.get("/customers/:customerId", authenticate, getCustomerById);
  //------------------------------------------------------------------------------------------------------
  // Anamnesis Types
  router.post("/customers/anamnesis/types", authenticate, createAnamnesisType);
  router.get(
    "/customers/anamnesis/types/:anamnesisTypeId",
    authenticate,
    getAnamnesisTypeById
  );
  router.get("/customers/anamnesis/types", authenticate, getAnamnesisTypeList);
  router.put(
    "/customers/anamnesis/types/:anamnesisTypeId",
    authenticate,
    updateAnamnesisType
  );
  //------------------------------------------------------------------------------------------------------
  // Anamnesis
  router.post(
    "/customers/:customerId/anamnesis",
    authenticate,
    upload.fields([
      {
        name: "customerId",
      },
      {
        name: "date",
      },
      {
        name: "anamnesisTypesContent",
      },
      {
        name: "files",
      },
    ]),
    createAnamnesis
  );
  router.get(
    "/customers/:customerId/anamnesis/:anamnesisId",
    authenticate,
    getAnamnesisById
  );
  router.put(
    "/customers/:customerId/anamnesis/:anamnesisId",
    authenticate,
    upload.fields([
      {
        name: "anamneseId",
      },
      {
        name: "customerId",
      },
      {
        name: "date",
      },
      {
        name: "anamnesisTypesContent",
      },
      {
        name: "files",
      },
    ]),
    updateAnamnesis
  );
  router.get(
    "/customers/:customerId/anamnesis",
    authenticate,
    getAnamnesisList
  );
  //------------------------------------------------------------------------------------------------------
  // Service Types
  router.post("/customers/services/types", authenticate, createServiceType);
  router.get(
    "/customers/services/types/:serviceTypeId",
    authenticate,
    getServiceTypeById
  );
  router.put(
    "/customers/services/types/:serviceTypeId",
    authenticate,
    updateServiceType
  );
  router.get("/customers/services/types", authenticate, getServiceTypeList);
  //------------------------------------------------------------------------------------------------------
  // Services
  router.post(
    "/customers/:customerId/services",
    authenticate,
    upload.fields([
      {
        name: "date",
      },
      {
        name: "serviceTypes",
      },
      {
        name: "beforeNotes",
      },
      {
        name: "afterNotes",
      },
      {
        name: "beforePhotos",
      },
      {
        name: "afterPhotos",
      },
    ]),
    createService
  );

  router.put(
    "/customers/:customerId/services/:serviceId",
    authenticate,
    upload.fields([
      {
        name: "date",
      },
      {
        name: "serviceTypes",
      },
      {
        name: "beforeNotes",
      },
      {
        name: "afterNotes",
      },
      {
        name: "beforePhotos",
      },
      {
        name: "afterPhotos",
      },
    ]),
    updateService
  );

  router.get(
    "/customers/:customerId/services/:serviceId",
    authenticate,
    getServiceById
  );

  router.get("/customers/:customerId/services", authenticate, getServices);

  router.get("/customers/services", authenticate, getServicesAgenda);

  return router;
};
