const express = require("express");
const router = express.Router();
const { getHomeSections } = require("../controllers/homeController");
const { optionalAuth } = require("../middlewares/auth");

router.get("/", optionalAuth, getHomeSections);

module.exports = router;
