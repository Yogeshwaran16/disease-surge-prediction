const mongoose = require("mongoose");

require("dotenv").config();

const District =
  require("../models/District");


const districts = [

  {
    name: "Chennai",
    region: "Tamil Nadu",
    population: 7090000,
    hospitals: 45,
    phcs: 20,
    lat: 13.0827,
    lng: 80.2707,
  },

  {
    name: "Coimbatore",
    region: "Tamil Nadu",
    population: 3458000,
    hospitals: 35,
    phcs: 18,
    lat: 11.0168,
    lng: 76.9558,
  },

  {
    name: "Madurai",
    region: "Tamil Nadu",
    population: 3038000,
    hospitals: 28,
    phcs: 16,
    lat: 9.9252,
    lng: 78.1198,
  },

  {
    name: "Tiruchirappalli",
    region: "Tamil Nadu",
    population: 2729000,
    hospitals: 25,
    phcs: 15,
    lat: 10.7905,
    lng: 78.7047,
  },

  {
    name: "Salem",
    region: "Tamil Nadu",
    population: 3482000,
    hospitals: 24,
    phcs: 17,
    lat: 11.6643,
    lng: 78.1460,
  },

];


const seedDistricts = async () => {

  try {

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "✅ MongoDB Connected"
    );


    let addedCount = 0;
    let existingCount = 0;


    for (
      const districtData
      of districts
    ) {

      const existingDistrict =
        await District.findOne({
          name: districtData.name,
        });


      if (existingDistrict) {

        console.log(
          `⚠️ Already exists: ${districtData.name}`
        );

        existingCount++;

      } else {

        await District.create(
          districtData
        );

        console.log(
          `✅ Added: ${districtData.name}`
        );

        addedCount++;

      }

    }


    console.log("\n========================");

    console.log(
      `🌱 Added: ${addedCount}`
    );

    console.log(
      `📦 Already Existing: ${existingCount}`
    );

    console.log(
      "🎉 District seeding completed"
    );

    console.log("========================\n");


    await mongoose.disconnect();

    process.exit(0);

  } catch (error) {

    console.error(
      "❌ Seed Error:",
      error.message
    );

    process.exit(1);

  }

};


seedDistricts();