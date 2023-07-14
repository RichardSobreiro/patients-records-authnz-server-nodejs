/** @format */

import Router from "koa-router";
import multer from "@koa/multer";
import customersController from "../controllers/customers.controller";
import proceedingsController from "../controllers/proceedings.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const upload = multer();

export default () => {
  const router = new Router();

  const { pi, createCustomer, getCustomers, getCustomerById, updateCustomer } =
    customersController();

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
  router.post(
    "/customers/:customerId/proceedings",
    authenticate,
    upload.fields([
      {
        name: "date",
      },
      {
        name: "proceedingTypeDescription",
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
    "/customers/:customerId/proceedings/:proceedingId",
    authenticate,
    upload.fields([
      {
        name: "date",
      },
      {
        name: "proceedingTypeDescription",
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
    "/customers/:customerId/proceedings/:proceedingId",
    authenticate,
    getProceedingById
  );

  router.get(
    "/customers/:customerId/proceedings",
    authenticate,
    getProceedings
  );

  router.get(
    "/professionals/:email/proceedings/types",
    authenticate,
    getProceedingsTypesByEmail
  );

  return router;
};
