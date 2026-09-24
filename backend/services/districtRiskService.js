const District = require("../models/District");
const Prediction = require("../models/Prediction");

class DistrictRiskService {

    async getDistrictRiskData() {

        const districts =
            await District.find();

        const result =
            await Promise.all(

                districts.map(
                    async (district) => {

                        const prediction =
                            await Prediction.findOne({
                                district: district.name
                            })
                            .sort({
                                createdAt: -1
                            });

                        return {
                            district:
                                district.name,

                            lat:
                                district.lat,

                            lng:
                                district.lng,

                            population:
                                district.population,

                            hospitals:
                                district.hospitals,

                            phcs:
                                district.phcs,

                            risk_level:
                                prediction?.risk_level ||
                                district.risk_level,

                            surge_probability:
                                prediction?.surge_probability || 0,

                            expected_cases:
                                prediction?.expected_cases_2w || 0
                        };
                    }
                )
            );

        return result;
    }
}

module.exports =
new DistrictRiskService();