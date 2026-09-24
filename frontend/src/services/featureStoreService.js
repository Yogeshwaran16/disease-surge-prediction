import API from "./api";


// ============================================
// FEATURE STORE SERVICE
// ============================================


// ============================================
// GET ALL FEATURES
// ============================================

export const getAllFeatures =
  async (
    skip = 0,
    limit = 100
  ) => {

    const response =
      await API.get(
        `/api/v1/features?skip=${skip}&limit=${limit}`
      );

    return response.data;

  };


// ============================================
// GET FEATURE COUNT
// ============================================

export const getFeatureCount =
  async () => {

    const response =
      await API.get(
        "/api/v1/features/count"
      );

    return response.data;

  };


// ============================================
// GET DISTRICT FEATURES
// ============================================

export const getDistrictFeatures =
  async (
    district
  ) => {

    const response =
      await API.get(
        `/api/v1/features/district/${encodeURIComponent(
          district
        )}`
      );

    return response.data;

  };


// ============================================
// GET LATEST FEATURE
// ============================================

export const getLatestFeature =
  async (
    district,
    disease
  ) => {

    const response =
      await API.get(
        `/api/v1/features/latest`,
        {
          params: {
            district,
            disease,
          },
        }
      );

    return response.data;

  };


// ============================================
// DEFAULT EXPORT
// ============================================

const featureStoreService = {

  getAllFeatures,

  getFeatureCount,

  getDistrictFeatures,

  getLatestFeature,

};


export default featureStoreService;
