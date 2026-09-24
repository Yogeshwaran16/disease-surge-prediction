const Prediction = require("../models/Prediction");

const fs = require("fs");

const path = require("path");

const csv = require("csv-parser");



exports.getValidationScorecard = async (req, res) => {

try {

const districtPredictions =

await Prediction.aggregate([

{

$sort: {

surge_probability: -1,

},

},

{

$group: {

_id: "$district",





        district: {

          $first: "$district",

        },



        disease: {

          $first: "$disease",

        },



        risk_level: {

          $first: "$risk_level",

        },



        surge_probability: {

          $first: "$surge_probability",

        },



        expected_cases_2w: {

          $first:

            "$expected_cases_2w",

        },



        createdAt: {

          $first: "$createdAt",

        },

      },

    },

  ]);



const datasetSize =

  await Prediction.countDocuments();



const districtCount =

  districtPredictions.length;



let high = 0;

let medium = 0;

let low = 0;



districtPredictions.forEach(

  (district) => {

    const risk =

      String(

        district.risk_level || ""

      ).toUpperCase();



    if (risk === "HIGH") {

      high++;

    } else if (

      risk === "MEDIUM"

    ) {

      medium++;

    } else {

      low++;

    }

  }

);



const csvPath = path.join(

  __dirname,

  "../data/validation_metrics.csv"

);



const leadTimeValidation = [];



await new Promise(

  (resolve, reject) => {

    fs.createReadStream(csvPath)

      .pipe(csv())

      .on("data", (row) => {

        leadTimeValidation.push({

          horizon:

            row.horizon,



          precision:

            Number(

              row.precision

            ),



          recall:

            Number(

              row.recall

            ),



          f1_score:

            Number(

              row.f1_score

            ),



          baseline_f1:

            Number(

              row.baseline_f1

            ),

        });

      })

      .on(

        "end",

        resolve

      )

      .on(

        "error",

        reject

      );

  }

);



const model14Day =

  leadTimeValidation.find(

    (item) =>

      item.horizon ===

      "14 Days"

  );



return res.status(200).json({

  success: true,



  validation: {

    dataset_size:

      datasetSize,



    district_count:

      districtCount,



    precision:

      model14Day

        ?.precision || 0,



    recall:

      model14Day

        ?.recall || 0,



    f1_score:

      model14Day

        ?.f1_score || 0,



    lead_time_validation:

      leadTimeValidation,



    risk_distribution: {

      high,

      medium,

      low,

    },

  },

});





} catch (error) {

console.error(

"Validation Controller Error:",

error

);





return res.status(500).json({

  success: false,



  validation: {

    dataset_size: 0,

    district_count: 0,

    precision: 0,

    recall: 0,

    f1_score: 0,

    lead_time_validation: [],

    risk_distribution: {

      high: 0,

      medium: 0,

      low: 0,

    },

  },

});





}

};