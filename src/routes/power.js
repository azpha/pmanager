const router = require('express').Router();
const PowerStatus = require('../controllers/PowerStatus');
const SecretValidation = require('../utils/SecretValidation');

router.post("/status", SecretValidation, PowerStatus.PowerControl);
router.get("/status", PowerStatus.ScriptStatus)

module.exports = router;