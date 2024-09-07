import { Router } from "express";
import PowerController from "../controllers/PowerController";
import SecretValidation from "../utils/SecretValidation";

const router = Router();
router.post('/', SecretValidation.validateSecret, PowerController.PowerControl)

export default router;