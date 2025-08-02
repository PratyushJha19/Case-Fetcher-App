import express from "express";
import { getCaptcha, submitDetails } from "../controllers/caseController.js";

const router = express.Router();

router.post("/get-captcha", getCaptcha);
// router.post("/get-captcha", testController);
router.post("/submit-details", submitDetails);

export default router;
