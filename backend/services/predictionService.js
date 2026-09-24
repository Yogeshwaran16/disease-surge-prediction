const pool = require("../config/db");

// =====================================================
// Get All Predictions
// =====================================================

exports.getAllPredictions = async () => {
  const result = await pool.query(`
    SELECT *
    FROM prediction.predictions
    ORDER BY year DESC, week_number DESC
  `);

  return result.rows;
};


// =====================================================
// Get Prediction By ID
// =====================================================

exports.getPredictionById = async (id) => {

  const result = await pool.query(
    `
    SELECT *
    FROM prediction.predictions
    WHERE prediction_id = $1
    `,
    [id]
  );

  return result.rows[0];
};


// =====================================================
// Get Predictions By District
// =====================================================

exports.getPredictionsByDistrict = async (district) => {

  const result = await pool.query(
    `
    SELECT *
    FROM prediction.predictions
    WHERE LOWER(district) = LOWER($1)
    ORDER BY year DESC, week_number DESC
    `,
    [district]
  );

  return result.rows;
};


// =====================================================
// Create Prediction
// =====================================================

exports.createPrediction = async (data) => {

  const {
    district,
    disease,
    year,
    week_number,
    surge_probability,
    expected_cases_2w,
    risk_level,
    alert
  } = data;

  const result = await pool.query(
    `
    INSERT INTO prediction.predictions (
      district,
      disease,
      year,
      week_number,
      surge_probability,
      expected_cases_2w,
      risk_level,
      alert
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
    `,
    [
      district,
      disease,
      year,
      week_number,
      surge_probability,
      expected_cases_2w,
      risk_level,
      alert
    ]
  );

  return result.rows[0];
};


// =====================================================
// Update Prediction
// =====================================================

exports.updatePrediction = async (id, data) => {

  const {
    district,
    disease,
    year,
    week_number,
    surge_probability,
    expected_cases_2w,
    risk_level,
    alert
  } = data;

  const result = await pool.query(
    `
    UPDATE prediction.predictions
    SET
      district = $1,
      disease = $2,
      year = $3,
      week_number = $4,
      surge_probability = $5,
      expected_cases_2w = $6,
      risk_level = $7,
      alert = $8,
      updated_at = CURRENT_TIMESTAMP
    WHERE prediction_id = $9
    RETURNING *
    `,
    [
      district,
      disease,
      year,
      week_number,
      surge_probability,
      expected_cases_2w,
      risk_level,
      alert,
      id
    ]
  );

  return result.rows[0];
};


// =====================================================
// Delete Prediction
// =====================================================

exports.deletePrediction = async (id) => {

  const result = await pool.query(
    `
    DELETE FROM prediction.predictions
    WHERE prediction_id = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
};


// =====================================================
// High Risk Predictions
// =====================================================

exports.getHighRiskPredictions = async () => {

  const result = await pool.query(`
    SELECT *
    FROM prediction.predictions
    WHERE risk_level = 'HIGH'
       OR surge_probability >= 0.7
    ORDER BY surge_probability DESC
  `);

  return result.rows;
};


// =====================================================
// Top Risk Districts
// =====================================================

exports.getTopRiskDistricts = async (limit = 10) => {

  const result = await pool.query(
    `
    SELECT DISTINCT ON (district)
      prediction_id,
      district,
      disease,
      year,
      week_number,
      surge_probability,
      expected_cases_2w,
      risk_level,
      alert
    FROM prediction.predictions
    ORDER BY district, year DESC, week_number DESC
    `
  );

  return result.rows
    .sort(
      (a, b) =>
        Number(b.surge_probability) -
        Number(a.surge_probability)
    )
    .slice(0, limit);
};


// =====================================================
// Dashboard Summary
// =====================================================

exports.getDashboardSummary = async () => {

  const result = await pool.query(`
    SELECT DISTINCT ON (district)
      prediction_id,
      district,
      disease,
      year,
      week_number,
      surge_probability,
      expected_cases_2w,
      risk_level,
      alert
    FROM prediction.predictions
    ORDER BY district, year DESC, week_number DESC
  `);

  const predictions = result.rows;

  // Sort risk
  predictions.sort(
    (a, b) =>
      Number(b.surge_probability) -
      Number(a.surge_probability)
  );

  const totalDistricts = predictions.length;

  const highRiskCount = predictions.filter(
    d => d.risk_level === "HIGH"
  ).length;

  const mediumRiskCount = predictions.filter(
    d => d.risk_level === "MEDIUM"
  ).length;

  const lowRiskCount = predictions.filter(
    d => d.risk_level === "LOW"
  ).length;

  return {

    summary: {
      totalPredictions: totalDistricts,
      totalDistricts,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      last_updated: new Date()
    },

    all_districts: predictions,

    top_risk_districts: predictions.slice(0, 10)
  };
};