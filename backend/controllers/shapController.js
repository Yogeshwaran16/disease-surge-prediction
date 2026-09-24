const fs = require("fs");
const path = require("path");

// ======================================================
// LOAD SHAP DATA
// ======================================================

const loadShapData = () => {

    const filePath = path.join(
        __dirname,
        "../data/shap_output.json"
    );

    if (!fs.existsSync(filePath)) {
        throw new Error(
            "shap_output.json not found"
        );
    }

    const rawData = fs.readFileSync(
        filePath,
        "utf8"
    );

    return JSON.parse(rawData);
};


// ======================================================
// BUILD TOP FEATURES
// ======================================================

const buildTopFeatures = (
    features,
    topN = 5
) => {

    if (!Array.isArray(features)) {
        return [];
    }

    return [...features]
        .sort(
            (a, b) =>
                Math.abs(Number(b?.impact || 0)) -
                Math.abs(Number(a?.impact || 0))
        )
        .slice(0, topN)
        .map((item, index) => ({
            rank: index + 1,

            feature:
                item?.feature || "Unknown",

            impact:
                Number(item?.impact || 0)
        }));
};


// ======================================================
// BUILD NARRATIVE
// ======================================================

const buildNarrative = (
    district,
    topFeatures
) => {

    if (!topFeatures.length) {

        return (
            `No SHAP feature explanation is available ` +
            `for ${district}.`
        );

    }

    const featureNames =
        topFeatures.map(
            (item) => item.feature
        );

    return (
        `The main SHAP contributing features ` +
        `for ${district} are ` +
        `${featureNames.join(", ")}.`
    );
};


// ======================================================
// GET ALL SHAP DATA
// ======================================================

exports.getAllShapData = async (
    req,
    res
) => {

    try {

        const shapData =
            loadShapData();

        const data =
            shapData.map((item) => {

                const topFeatures =
                    buildTopFeatures(
                        item.features,
                        5
                    );

                return {
                    district:
                        item.district,

                    top_features:
                        topFeatures,

                    narrative:
                        buildNarrative(
                            item.district,
                            topFeatures
                        ),

                    features:
                        item.features || []
                };

            });

        return res.status(200).json({

            success: true,

            count: data.length,

            data

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


// ======================================================
// GET SHAP DATA FOR ONE DISTRICT
// ======================================================

exports.getDistrictShap = async (
    req,
    res
) => {

    try {

        const district =
            req.params.district;

        const shapData =
            loadShapData();

        const districtData =
            shapData.find(
                (item) =>
                    String(item?.district || "")
                        .toLowerCase() ===
                    String(district || "")
                        .toLowerCase()
            );

        if (!districtData) {

            return res.status(404).json({

                success: false,

                message:
                    "District SHAP data not found"

            });

        }

        const topFeatures =
            buildTopFeatures(
                districtData.features,
                5
            );

        return res.status(200).json({

            success: true,

            data: {

                district:
                    districtData.district,

                top_features:
                    topFeatures,

                narrative:
                    buildNarrative(
                        districtData.district,
                        topFeatures
                    ),

                features:
                    districtData.features || []

            }

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};