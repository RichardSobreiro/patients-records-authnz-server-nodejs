/** @format */

import Router from "koa-router";
import multer from "@koa/multer";
import customersController from "../controllers/customers.controller";
import proceedingsController from "../controllers/proceedings.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import anamnesisController from "../controllers/anamnesis.controller";
import serviceTypesController from "../controllers/service-types.controller";

const upload = multer();

export default () => {
  const router = new Router();

  const { pi, createCustomer, getCustomers, getCustomerById, updateCustomer } =
    customersController();

  const {
    createAnamnesis,
    updateAnamnesis,
    getAnamnesisById,
    getAnamnesisList,
  } = anamnesisController();

  const { createServiceType, getServiceTypeList, updateServiceType } =
    serviceTypesController();

  const {
    createProceeding,
    getProceedingById,
    getProceedings,
    getProceedingsTypesByEmail,
    updateProceeding,
  } = proceedingsController();

  //------------------------------------------------------------------------------------------------------
  router.get("/pi", authenticate, authorize("api:read"), pi);
  router.post("/customers", authenticate, createCustomer);
  router.put("/customers/:customerId", authenticate, updateCustomer);
  router.get("/customers", authenticate, getCustomers);
  router.get("/customers/:customerId", authenticate, getCustomerById);
  //------------------------------------------------------------------------------------------------------
  // ANAMNESIS
  router.post(
    "/customers/:customerId/anamnesis",
    authenticate,
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
  router.get("/customers/services/types", authenticate, getServiceTypeList);
  router.put(
    "/customers/services/types/:serviceTypeId",
    authenticate,
    updateServiceType
  );
  //------------------------------------------------------------------------------------------------------
  router.post(
    "/customers/:customerId/proceedings",
    authenticate,
    upload.fields([
      {
        name: "date",
      },
      {
        name: "serviceTypeDescription",
      },
      {
        name: "notes",
      },
      {
        name: "beforePhotos",
        maxCount: 5,
      },
      {
        name: "afterPhotos",
        maxCount: 5,
      },
    ]),
    createProceeding
  );

  router.put(
    "/customers/:customerId/proceedings/:serviceId",
    authenticate,
    upload.fields([
      {
        name: "date",
      },
      {
        name: "serviceTypeDescription",
      },
      {
        name: "notes",
      },
      {
        name: "beforePhotos",
        maxCount: 5,
      },
      {
        name: "afterPhotos",
        maxCount: 5,
      },
    ]),
    updateProceeding
  );

  router.get(
    "/customers/:customerId/proceedings/:serviceId",
    authenticate,
    getProceedingById
  );

  router.get(
    "/customers/:customerId/proceedings",
    authenticate,
    getProceedings
  );

  return router;
};
