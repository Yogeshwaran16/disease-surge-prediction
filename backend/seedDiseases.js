require("dotenv").config();

const mongoose = require("mongoose");

const Disease = require("./models/Disease");


const diseases = [

  {
    name: "Dengue",
    category: "Viral",
    description:
      "A mosquito-borne viral disease common in tropical regions.",
    transmission_type: "VECTOR",
    incubation_period: "4-10 days",
    symptoms: [
      "High fever",
      "Headache",
      "Muscle pain",
      "Joint pain",
      "Skin rash",
    ],
    prevention: [
      "Avoid mosquito bites",
      "Remove standing water",
      "Use mosquito nets",
    ],
  },

  {
    name: "Malaria",
    category: "Parasitic",
    description:
      "A mosquito-borne disease caused by Plasmodium parasites.",
    transmission_type: "VECTOR",
    incubation_period: "7-30 days",
    symptoms: [
      "Fever",
      "Chills",
      "Sweating",
      "Headache",
      "Fatigue",
    ],
    prevention: [
      "Use mosquito nets",
      "Use mosquito repellents",
      "Control mosquito breeding",
    ],
  },

  {
    name: "Chikungunya",
    category: "Viral",
    description:
      "A mosquito-borne viral disease causing fever and joint pain.",
    transmission_type: "VECTOR",
    incubation_period: "3-7 days",
    symptoms: [
      "Fever",
      "Joint pain",
      "Headache",
      "Fatigue",
      "Skin rash",
    ],
    prevention: [
      "Avoid mosquito bites",
      "Remove standing water",
      "Use mosquito repellent",
    ],
  },

  {
    name: "Typhoid",
    category: "Bacterial",
    description:
      "A bacterial infection spread through contaminated food and water.",
    transmission_type: "FOODBORNE",
    incubation_period: "6-30 days",
    symptoms: [
      "High fever",
      "Weakness",
      "Stomach pain",
      "Headache",
    ],
    prevention: [
      "Drink safe water",
      "Maintain food hygiene",
      "Wash hands regularly",
    ],
  },

  {
    name: "Cholera",
    category: "Bacterial",
    description:
      "An acute bacterial infection causing severe diarrhea.",
    transmission_type: "WATERBORNE",
    incubation_period: "12 hours to 5 days",
    symptoms: [
      "Severe diarrhea",
      "Vomiting",
      "Dehydration",
    ],
    prevention: [
      "Drink clean water",
      "Maintain sanitation",
      "Practice hand hygiene",
    ],
  },

  {
    name: "Influenza",
    category: "Viral",
    description:
      "A contagious respiratory illness caused by influenza viruses.",
    transmission_type: "AIRBORNE",
    incubation_period: "1-4 days",
    symptoms: [
      "Fever",
      "Cough",
      "Sore throat",
      "Body pain",
      "Fatigue",
    ],
    prevention: [
      "Vaccination",
      "Wash hands",
      "Avoid close contact with infected people",
    ],
  },

];


// ============================================
// CONNECT AND SEED
// ============================================

async function seedDiseases() {

  try {

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "✅ MongoDB Connected"
    );

    let added = 0;
    let existing = 0;


    for (const disease of diseases) {

      const alreadyExists =
        await Disease.findOne({
          name: disease.name,
        });


      if (alreadyExists) {

        console.log(
          `⚠️ Already exists: ${disease.name}`
        );

        existing++;

        continue;
      }


      await Disease.create(disease);

      console.log(
        `🌱 Added: ${disease.name}`
      );

      added++;
    }


    console.log(
      "\n========================"
    );

    console.log(
      `🌱 Added: ${added}`
    );

    console.log(
      `📦 Already Existing: ${existing}`
    );

    console.log(
      "🎉 Disease seeding completed"
    );

    console.log(
      "========================"
    );


    await mongoose.connection.close();

    process.exit(0);

  } catch (error) {

    console.error(
      "❌ Seeding Error:",
      error
    );

    process.exit(1);
  }

}


seedDiseases();
