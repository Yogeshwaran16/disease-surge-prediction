const express = require("express");

const router = express.Router();

const {
  getValidationScorecard,
} = require("../controllers/validationController");

router.get(
  "/",
  getValidationScorecard
);

module.exports = router;