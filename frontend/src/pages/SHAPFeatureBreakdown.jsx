import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getDistrictShap } from "../services/api";

export default function SHAPFeatureBreakdown() {
  const [district, setDistrict] = useState("Chennai");
  const [searchDistrict, setSearchDistrict] = useState("Chennai");
  const [shapData, setShapData] = useState([]);
  const [narrative, setNarrative] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // NORMALIZE SHAP RESPONSE
  // ==========================================

  const normalizeShapData = useCallback((response) => {
    if (!response) return [];

    const data = response?.data;

    if (!data) return [];

    const features = Array.isArray(data?.features)
      ? data.features
      : Array.isArray(data)
      ? data
      : [];

    return features
      .map((item, index) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const feature =
          item.feature ??
          item.feature_name ??
          item.name ??
          `Feature ${index + 1}`;

        const rawImpact =
          item.impact ??
          item.shap_value ??
          item.shapValue ??
          item.value ??
          0;

        const impact = Number(rawImpact);

        return {
          feature: String(feature),
          impact: Number.isFinite(impact) ? impact : 0,
          raw: item,
        };
      })
      .filter(Boolean);
  }, []);

  // ==========================================
  // LOAD SHAP DATA
  // ==========================================

  const loadShapData = useCallback(
    async (districtName) => {
      const cleanDistrict = String(
        districtName || ""
      ).trim();

      if (!cleanDistrict) {
        setError("District name is required.");
        setShapData([]);
        setNarrative("");
        return;
      }

      try {
        setLoading(true);
        setError("");
        setShapData([]);
        setNarrative("");

        const response = await getDistrictShap(
          cleanDistrict
        );

        const normalized =
          normalizeShapData(response);

        if (normalized.length === 0) {
          setError(
            "No SHAP data available for this district."
          );
          return;
        }

        setDistrict(cleanDistrict);
        setShapData(normalized);

        setNarrative(
          response?.data?.narrative || ""
        );
      } catch (err) {
        console.error(
          "SHAP Feature Breakdown Error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.detail ||
            err?.message ||
            "Failed to load SHAP data."
        );

        setShapData([]);
        setNarrative("");
      } finally {
        setLoading(false);
      }
    },
    [normalizeShapData]
  );

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadShapData("Chennai");
  }, [loadShapData]);

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = () => {
    const cleanDistrict =
      searchDistrict.trim();

    if (!cleanDistrict) {
      setError("Please enter a district name.");
      return;
    }

    loadShapData(cleanDistrict);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // ==========================================
  // SORT BY IMPACT
  // ==========================================

  const sortedFeatures = useMemo(() => {
    return [...shapData].sort(
      (a, b) =>
        Math.abs(b.impact) -
        Math.abs(a.impact)
    );
  }, [shapData]);

  // ==========================================
  // MAX IMPACT
  // ==========================================

  const maxImpact = useMemo(() => {
    if (sortedFeatures.length === 0) {
      return 1;
    }

    return Math.max(
      ...sortedFeatures.map((item) =>
        Math.abs(item.impact)
      ),
      1
    );
  }, [sortedFeatures]);

  // ==========================================
  // TOTAL IMPACT
  // ==========================================

  const totalImpact = useMemo(() => {
    return sortedFeatures.reduce(
      (sum, item) =>
        sum + Math.abs(item.impact),
      0
    );
  }, [sortedFeatures]);

  // ==========================================
  // FORMAT VALUE
  // ==========================================

  const formatValue = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0.000";
    }

    return number.toFixed(3);
  };

  // ==========================================
  // FEATURE NAME
  // ==========================================

  const formatFeatureName = (name) => {
    return String(
      name || "Unknown Feature"
    )
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (char) => char.toUpperCase()
      );
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="
      min-h-full
      p-6
      space-y-6
      text-white
    ">

      {/* HEADER */}

      <div className="
        flex
        flex-col
        lg:flex-row
        lg:items-center
        lg:justify-between
        gap-4
      ">

        <div>
          <h1 className="
            text-3xl
            font-bold
          ">
            SHAP Feature Breakdown
          </h1>

          <p className="
            text-slate-400
            mt-1
          ">
            AI-powered feature importance analysis
          </p>
        </div>

        <div className="
          bg-slate-800
          border
          border-slate-700
          rounded-lg
          px-4
          py-2
          text-sm
          text-slate-300
        ">
          📍 {district || "Chennai"}
        </div>

      </div>

      {/* SEARCH */}

      <div className="
        flex
        flex-col
        md:flex-row
        gap-3
      ">

        <input
          type="text"
          value={searchDistrict}
          onChange={(event) =>
            setSearchDistrict(
              event.target.value
            )
          }
          onKeyDown={handleKeyDown}
          placeholder="Enter district name..."
          className="
            flex-1
            bg-slate-800
            border
            border-slate-700
            rounded-lg
            px-4
            py-3
            text-white
            outline-none
            focus:border-cyan-500
          "
        />

        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="
            bg-cyan-600
            hover:bg-cyan-700
            disabled:opacity-50
            disabled:cursor-not-allowed
            text-white
            px-6
            py-3
            rounded-lg
            font-semibold
            transition
          "
        >
          {loading
            ? "Loading..."
            : "🔍 Analyze"}
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="
          bg-red-900/50
          border
          border-red-500
          text-red-200
          p-4
          rounded-lg
        ">
          {error}
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="
          bg-slate-800
          border
          border-slate-700
          rounded-xl
          p-10
          text-center
          text-slate-400
        ">
          Loading SHAP feature contributions...
        </div>
      )}

      {/* EMPTY */}

      {!loading &&
        sortedFeatures.length === 0 && (
          <div className="
            bg-slate-900
            border
            border-slate-800
            rounded-xl
            min-h-[420px]
            flex
            items-center
            justify-center
          ">
            <div className="
              text-center
              text-slate-500
            ">
              <div className="
                text-5xl
                mb-4
              ">
                🧠
              </div>

              <p className="
                text-lg
                font-semibold
                text-slate-400
              ">
                No SHAP data available
              </p>

              <p className="
                text-sm
                mt-2
              ">
                Try another district.
              </p>
            </div>
          </div>
        )}

      {/* SHAP DATA */}

      {!loading &&
        sortedFeatures.length > 0 && (
          <>

            {/* SUMMARY CARDS */}

            <div className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
            ">

              <div className="
                bg-slate-800
                border
                border-slate-700
                rounded-xl
                p-5
              ">
                <p className="
                  text-slate-400
                  text-sm
                ">
                  Features Analyzed
                </p>

                <p className="
                  text-3xl
                  font-bold
                  mt-2
                ">
                  {sortedFeatures.length}
                </p>
              </div>

              <div className="
                bg-slate-800
                border
                border-slate-700
                rounded-xl
                p-5
              ">
                <p className="
                  text-slate-400
                  text-sm
                ">
                  Total Absolute Impact
                </p>

                <p className="
                  text-3xl
                  font-bold
                  mt-2
                ">
                  {formatValue(totalImpact)}
                </p>
              </div>

            </div>

            {/* NARRATIVE */}

            {narrative && (
              <div className="
                bg-slate-800
                border
                border-cyan-900
                rounded-xl
                p-6
              ">
                <h2 className="
                  text-xl
                  font-semibold
                  mb-3
                ">
                  🧠 AI Explanation
                </h2>

                <p className="
                  text-slate-300
                  leading-7
                ">
                  {narrative}
                </p>

                <p className="
                  text-xs
                  text-slate-500
                  mt-3
                ">
                  Note: Current SHAP data represents
                  impact magnitude only; it does not
                  indicate whether a feature increases
                  or decreases risk.
                </p>
              </div>
            )}

            {/* FEATURE IMPACT RANKING */}

            <div className="
              bg-slate-800
              border
              border-slate-700
              rounded-xl
              p-6
            ">

              <div className="mb-6">
                <h2 className="
                  text-xl
                  font-semibold
                ">
                  Feature Impact Ranking
                </h2>

                <p className="
                  text-sm
                  text-slate-400
                  mt-1
                ">
                  Features ranked by absolute SHAP
                  impact magnitude.
                </p>
              </div>

              <div className="
                space-y-5
              ">

                {sortedFeatures.map(
                  (item, index) => {

                    const absoluteImpact =
                      Math.abs(item.impact);

                    const width =
                      Math.max(
                        4,
                        (
                          absoluteImpact /
                          maxImpact
                        ) * 100
                      );

                    return (
                      <div
                        key={`${item.feature}-${index}`}
                        className="space-y-2"
                      >

                        <div className="
                          flex
                          items-center
                          justify-between
                          gap-4
                        ">

                          <div className="
                            flex
                            items-center
                            gap-3
                            min-w-0
                          ">

                            <span className="
                              text-xs
                              text-slate-500
                              w-6
                            ">
                              #{index + 1}
                            </span>

                            <span className="
                              font-medium
                              truncate
                            ">
                              {formatFeatureName(
                                item.feature
                              )}
                            </span>

                          </div>

                          <span className="
                            font-mono
                            font-semibold
                            text-sm
                            text-cyan-400
                          ">
                            {formatValue(
                              item.impact
                            )}
                          </span>

                        </div>

                        <div className="
                          h-3
                          bg-slate-900
                          rounded-full
                          overflow-hidden
                        ">
                          <div
                            className="
                              h-full
                              rounded-full
                              bg-cyan-500
                              transition-all
                              duration-500
                            "
                            style={{
                              width: `${width}%`,
                            }}
                          />
                        </div>

                        <div className="
                          text-xs
                          text-slate-500
                        ">
                          Impact magnitude
                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            </div>

            {/* FEATURE TABLE */}

            <div className="
              bg-slate-800
              border
              border-slate-700
              rounded-xl
              overflow-hidden
            ">

              <div className="
                p-6
                border-b
                border-slate-700
              ">
                <h2 className="
                  text-xl
                  font-semibold
                ">
                  SHAP Contribution Details
                </h2>
              </div>

              <div className="
                overflow-x-auto
              ">

                <table className="
                  w-full
                ">

                  <thead className="
                    bg-slate-700
                    text-slate-300
                  ">
                    <tr>

                      <th className="
                        p-4
                        text-left
                      ">
                        Rank
                      </th>

                      <th className="
                        p-4
                        text-left
                      ">
                        Feature
                      </th>

                      <th className="
                        p-4
                        text-left
                      ">
                        Impact Magnitude
                      </th>

                      <th className="
                        p-4
                        text-left
                      ">
                        Interpretation
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {sortedFeatures.map(
                      (item, index) => (
                        <tr
                          key={`table-${item.feature}-${index}`}
                          className="
                            border-t
                            border-slate-700
                          "
                        >

                          <td className="
                            p-4
                            text-slate-400
                          ">
                            #{index + 1}
                          </td>

                          <td className="
                            p-4
                            font-medium
                          ">
                            {formatFeatureName(
                              item.feature
                            )}
                          </td>

                          <td className="
                            p-4
                            font-mono
                            font-semibold
                            text-cyan-400
                          ">
                            {formatValue(
                              item.impact
                            )}
                          </td>

                          <td className="
                            p-4
                          ">
                            <span className="
                              px-3
                              py-1
                              rounded-full
                              text-xs
                              font-semibold
                              bg-cyan-900/60
                              text-cyan-300
                            ">
                              CONTRIBUTING FEATURE
                            </span>
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            </div>

          </>
        )}

    </div>
  );
}