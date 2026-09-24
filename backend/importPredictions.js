

const mongoose = require("mongoose");

const csv = require("csv-parser");

const fs = require("fs");

require("dotenv").config();



const Prediction = require("./models/Prediction");



mongoose

  .connect(process.env.MONGO_URI)

  .then(() => {

    console.log("MongoDB Connected");

  })

  .catch((err) => {

    console.error("MongoDB Connection Error:", err);

    process.exit(1);

  });



const predictions = [];



fs.createReadStream("../data/TamilNadu_IDSP_AllYears.csv")

  .pipe(csv())



  .on("data", (row) => {

    try {

      const district = row.district?.trim();



      const disease =

        row.disease?.trim()?.toLowerCase().replace(/\s+/g, "_") ||

        "unknown";



      const cases = Number(row.no_of_cases) || 0;



      const year = Number(row.year) || 2025;



      const weekNumber =

        Number(row.week_number) || 1;



      if (!district || !disease) {

        return;

      }



      // Temporary Risk Logic

      let riskLevel = "LOW";



      if (cases >= 75) {

        riskLevel = "HIGH";

      } else if (cases >= 30) {

        riskLevel = "MEDIUM";

      }



      // Temporary Probability Logic

      const probability = Math.min(

        Number((cases / 150).toFixed(2)),

        1

      );



      predictions.push({

        district,

        disease,

        year,

        week_number: weekNumber,



        surge_probability: probability,



        expected_cases_2w: Math.round(

          cases * 1.2

        ),



        risk_level: riskLevel,



        alert: riskLevel === "HIGH",



        model_version: "v1.1-imported",



        createdAt: new Date(),

        updatedAt: new Date(),

      });

    } catch (err) {

      console.log(

        "Skipped Row:",

        err.message

      );

    }

  })



  .on("end", async () => {

    try {

      console.log(

        `Rows Parsed: ${predictions.length}`

      );



      const bulkOperations =

        predictions.map((prediction) => ({

          updateOne: {

            filter: {

              district: prediction.district,

              disease: prediction.disease,

              year: prediction.year,

              week_number:

                prediction.week_number,

            },



            update: {

              $set: {

                surge_probability:

                  prediction.surge_probability,



                expected_cases_2w:

                  prediction.expected_cases_2w,



                risk_level:

                  prediction.risk_level,



                alert: prediction.alert,



                model_version:

                  prediction.model_version,



                updatedAt: new Date(),

              },



              $setOnInsert: {

                district:

                  prediction.district,



                disease:

                  prediction.disease,



                year: prediction.year,



                week_number:

                  prediction.week_number,



                createdAt: new Date(),

              },

            },



            upsert: true,

          },

        }));



      const result =

        await Prediction.bulkWrite(

          bulkOperations

        );



      console.log(

        "Bulk Import Completed"

      );



      console.log(

        `Inserted: ${result.upsertedCount}`

      );



      console.log(

        `Modified: ${result.modifiedCount}`

      );



      console.log(

        `Matched: ${result.matchedCount}`

      );



      process.exit(0);

    } catch (err) {

      console.error(

        "Import Error:",

        err

      );



      process.exit(1);

    }

  })



  .on("error", (err) => {

    console.error(

      "CSV Read Error:",

      err

    );



    process.exit(1);

  });

 