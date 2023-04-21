/** @format */

import { Router } from "express";

import { handleFacebookCallback } from "../controllers/social-login";

const router = Router();

router.post("/facebook/callback", handleFacebookCallback);

export default router;
