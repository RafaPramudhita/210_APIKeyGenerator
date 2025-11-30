const router = require("express").Router();
const { getAllApiKeys } = require("../controllers/apiKeyController");
const authAdmin = require("../middleware/authAdmin");

router.get("/", authAdmin, getAllApiKeys);

module.exports = router;
