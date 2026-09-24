const express = require("express");

const router = express.Router();

const {
    getDataSources
} = require("../controllers/dataSourceController");

router.get("/", getDataSources);

module.exports = router;