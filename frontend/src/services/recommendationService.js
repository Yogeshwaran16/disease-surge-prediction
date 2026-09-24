import api from "./api";


// ============================================
// GENERATE AI RECOMMENDATIONS
// ============================================

export const generateRecommendations =
  async (
    prediction
  ) => {

    const response =
      await api.post(

        "/api/v1/recommendations/generate",

        {

          district:
            prediction?.district ||
            "",


          disease:
            prediction?.disease ||
            "Dengue",


          risk_level:
            prediction?.risk_level ||
            "LOW",


          expected_cases_2w:
            Number(
              prediction?.expected_cases_2w
            ) || 0,


          surge_probability:
            Number(
              prediction?.surge_probability
            ) || 0,

            confidence_score:
  Number(
    prediction?.confidence_score ?? 0.91
  ),
  
        }

      );


    return response.data;

  };


// ============================================
// RECOMMENDATION SERVICE HEALTH
// ============================================

export const getRecommendationHealth =
  async () => {

    const response =
      await api.get(
        "/api/v1/recommendations/health"
      );


    return response.data;

  };
