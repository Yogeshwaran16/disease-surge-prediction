import { useState, useEffect } from "react";
import districtService from "../services/districtService";

export default function useDistricts(
  districtName = null
) {
  const [districts, setDistricts] =
    useState([]);

  const [district, setDistrict] =
    useState(null);

  const [ranking, setRanking] =
    useState([]);

  const [trend, setTrend] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchDistrictData =
    async () => {
      try {
        setLoading(true);

        const [
          districtList,
          rankingData,
        ] = await Promise.all([
          districtService.getAllDistricts(),
          districtService.getDistrictRanking(),
        ]);

        setDistricts(districtList);
        setRanking(rankingData);

        if (districtName) {
          const districtData =
            await districtService.getDistrictByName(
              districtName
            );

          const trendData =
            await districtService.getDistrictRiskTrend(
              districtName
            );

          setDistrict(districtData);
          setTrend(trendData);
        }

        setError("");
      } catch (err) {
        console.error(err);

        setError(
          "Failed to load district data"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDistrictData();
  }, [districtName]);

  return {
    districts,
    district,
    ranking,
    trend,
    loading,
    error,
    refreshDistricts:
      fetchDistrictData,
  };
}
