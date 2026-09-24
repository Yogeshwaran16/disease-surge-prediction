const Prediction =
require("../models/Prediction");

class ShapService {

    async getShapValues(
        district
    ) {

        const prediction =
            await Prediction.findOne({
                district
            })
            .sort({
                createdAt: -1
            });

        if (!prediction) {
            return null;
        }

        return {
            district,

            disease:
                prediction.disease,

            shap_values: [
                {
                    feature: "Rainfall",
                    contribution:
                        Number(
                            (
                                prediction.surge_probability *
                                0.30
                            ).toFixed(4)
                        )
                },

                {
                    feature: "Temperature",
                    contribution:
                        Number(
                            (
                                prediction.surge_probability *
                                0.25
                            ).toFixed(4)
                        )
                },

                {
                    feature: "Humidity",
                    contribution:
                        Number(
                            (
                                prediction.surge_probability *
                                0.20
                            ).toFixed(4)
                        )
                },

                {
                    feature: "EMRI Calls",
                    contribution:
                        Number(
                            (
                                prediction.surge_probability *
                                0.15
                            ).toFixed(4)
                        )
                },

                {
                    feature: "PHC Visits",
                    contribution:
                        Number(
                            (
                                prediction.surge_probability *
                                0.10
                            ).toFixed(4)
                        )
                }
            ]
        };
    }
}

module.exports =
new ShapService();