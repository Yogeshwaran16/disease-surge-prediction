const express = require("express");

const router = express.Router();

const {
    getAllDistricts,
    getDistrictById,
    createDistrict,
    updateDistrict,
    deleteDistrict
} = require("../controllers/districtController");

// ── Get All Districts ─────────────────────────────────────
router.get(
    "/",
    getAllDistricts
);

// ── Get District By ID ────────────────────────────────────
router.get(
    "/:id",
    getDistrictById
);

// ── Create District ───────────────────────────────────────
router.post(
    "/",
    createDistrict
);

// ── Update District ───────────────────────────────────────
router.put(
    "/:id",
    updateDistrict
);

// ── Delete District ───────────────────────────────────────
router.delete(
    "/:id",
    deleteDistrict
);

module.exports = router;