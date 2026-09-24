const express = require("express");

const router = express.Router();

const {
    getAllShapData,
    getDistrictShap
} = require(
    "../controllers/shapController"
);

// All districts
router.get(
    "/",
    getAllShapData
);

// Single district
router.get(
    "/:district",
    getDistrictShap
);

module.exports = router;