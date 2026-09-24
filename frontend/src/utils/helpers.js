// High Risk Districts

export const getHighRiskDistricts =
  (data = []) => {
    return data.filter(
      (district) =>
        district.risk_level ===
        "HIGH"
    );
  };

// Medium Risk Districts

export const getMediumRiskDistricts =
  (data = []) => {
    return data.filter(
      (district) =>
        district.risk_level ===
        "MEDIUM"
    );
  };

// Low Risk Districts

export const getLowRiskDistricts =
  (data = []) => {
    return data.filter(
      (district) =>
        district.risk_level ===
        "LOW"
    );
  };

// Sort By Probability

export const sortByRisk =
  (data = []) => {
    return [...data].sort(
      (a, b) =>
        b.surge_probability -
        a.surge_probability
    );
  };

// Search District

export const searchDistrict =
  (
    data = [],
    query = ""
  ) => {
    return data.filter(
      (district) =>
        district.district
          .toLowerCase()
          .includes(
            query.toLowerCase()
          )
    );
  };

// Total Expected Cases

export const getTotalExpectedCases =
  (data = []) => {
    return data.reduce(
      (total, item) =>
        total +
        item.expected_cases_2w,
      0
    );
  };

// Average Risk Score

export const getAverageRisk =
  (data = []) => {
    if (!data.length) return 0;

    const total =
      data.reduce(
        (sum, item) =>
          sum +
          item.surge_probability,
        0
      );

    return (
      total / data.length
    );
  };

// Generate Alert Count

export const getAlertCount =
  (data = []) => {
    return data.filter(
      (item) =>
        item.risk_level ===
        "HIGH"
    ).length;
  };
