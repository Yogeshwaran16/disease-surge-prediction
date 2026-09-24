const express = require("express");

const router = express.Router();

const {
    getMapData
} = require(
    "../controllers/mapController"
);

router.get(
    "/",
    getMapData
);

module.exports = router;