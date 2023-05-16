/** @format */

import Router from "koa-router";
import multer from "@koa/multer";
import patientsController from "../controllers/patients.controller";
import proceedingsController from "../controllers/proceedings.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const upload = multer();

export default () => {
  const router = new Router();

  const { pi, createPatient, getPatients, getPatientById, updatePatient } =
    patientsController();

  const {
    createProceeding,
    getProceedingById,
    getProceedings,
    getProceedingsTypesByEmail,
    updateProceeding,
  } = proceedingsController();

  router.get("/pi", authenticate, authorize("api:read"), pi);

  router.post("/patients", authenticate, createPatient);

  router.put("/patients/:patientId", authenticate, updatePatient);

  router.get("/patients", authenticate, getPatients);

  router.get("/patients/:patientId", authenticate, getPatientById);
  //------------------------------------------------------------------------------------------------------
  router.post(
    "/patients/:patientId/proceedings",
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
    "/patients/:patientId/proceedings/:proceedingId",
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
    "/patients/:patientId/proceedings/:proceedingId",
    authenticate,
    getProceedingById
  );

  router.get("/patients/:patientId/proceedings", authenticate, getProceedings);

  router.get(
    "/professionals/:email/proceedings/types",
    authenticate,
    getProceedingsTypesByEmail
  );

  return router;
};
