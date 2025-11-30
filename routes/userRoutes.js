const router = require("express").Router();
const { createUserWithApiKey, getAllUsers } = require("../controllers/userController");
const authAdmin = require("../middleware/authAdmin");

router.post("/create", createUserWithApiKey);
router.get("/", authAdmin, getAllUsers);

module.exports = router;
