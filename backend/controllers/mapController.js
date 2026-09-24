const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

// ======================================================
// GET DISTRICT MAP DATA
// ======================================================

exports.getMapData = async (
    req,
    res
) => {

    try {

        const filePath = path.join(
            __dirname,
            "../data/district_risk_scores.csv"
        );

        if (
            !fs.existsSync(filePath)
        ) {

            return res.status(404).json({
                success: false,
                message:
                    "district_risk_scores.csv not found"
            });

        }

        const results = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on(
                "data",
                (row) => {

                    results.push({

                        district:
                            row.district,

                        risk_score:
                            Number(
                                row.risk_score
                            ),

                        risk_level:
                            row.risk_level
                    });

                }
            )
            .on(
                "end",
                () => {

                    return res.status(200).json({

                        success: true,

                        count:
                            results.length,

                        data:
                            results
                    });

                }
            )
            .on(
                "error",
                (error) => {

                    return res.status(500).json({
                        success: false,
                        message:
                            error.message
                    });

                }
            );

    } catch (error) {

        return res.status(500).json({
            success: false,
            message:
                error.message
        });

    }

};