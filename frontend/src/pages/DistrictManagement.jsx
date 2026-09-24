import React, {
  useEffect,
  useState,
} from "react";

import districtService
  from "../services/districtService";

import {
  useAuth,
} from "../context/AuthContext";


export default function DistrictManagement() {

  // ==========================================
  // AUTH
  // ==========================================

  const { user } = useAuth();

  const userRole =
    user?.role?.toLowerCase();


  // ==========================================
  // STATES
  // ==========================================

  const [
    districts,
    setDistricts,
  ] = useState([]);

  const [
    stats,
    setStats,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    riskFilter,
    setRiskFilter,
  ] = useState("ALL");


  // ==========================================
  // FORM STATES
  // ==========================================

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    editingDistrict,
    setEditingDistrict,
  ] = useState(null);

  const [
    formData,
    setFormData,
  ] = useState({
    name: "",
    region: "Tamil Nadu",
    population: "",
    latitude: "",
    longitude: "",
    risk_level: "LOW",
  });


  // ==========================================
  // EMPTY FORM
  // ==========================================

  const getEmptyForm = () => ({
    name: "",
    region: "Tamil Nadu",
    population: "",
    latitude: "",
    longitude: "",
    risk_level: "LOW",
  });


  // ==========================================
  // LOAD DATA
  // ==========================================

  const loadData = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        districtsResponse,
        statsResponse,
      ] = await Promise.all([

        districtService
          .getAllDistricts(),

        districtService
          .getDistrictStats(),

      ]);

      setDistricts(
        districtsResponse?.data || []
      );

      setStats(
        statsResponse?.data || null
      );

    } catch (err) {

      console.error(
        "District Load Error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Failed to load districts."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {

    loadData();

  }, []);


  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = async () => {

    if (!search.trim()) {

      await loadData();

      return;

    }

    try {

      setError("");

      const response =
        await districtService
          .searchDistricts(
            search.trim()
          );

      setDistricts(
        response?.data || []
      );

    } catch (err) {

      console.error(
        "District Search Error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "District search failed."
      );

    }

  };


  // ==========================================
  // RISK FILTER
  // ==========================================

  const handleRiskFilter = async (
    risk
  ) => {

    setRiskFilter(risk);

    try {

      setError("");

      if (risk === "ALL") {

        await loadData();

        return;

      }

      const response =
        await districtService
          .getDistrictsByRisk(
            risk
          );

      setDistricts(
        response?.data || []
      );

    } catch (err) {

      console.error(
        "Risk Filter Error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Failed to filter districts."
      );

    }

  };


  // ==========================================
  // OPEN ADD FORM
  // ==========================================

  const handleAdd = () => {

    setEditingDistrict(null);

    setFormData(
      getEmptyForm()
    );

    setError("");
    setShowForm(true);

  };


  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  const handleEdit = (
    district
  ) => {

    setEditingDistrict(
      district
    );

    /*
      IMPORTANT:
      Backend may return:
        lat / lng

      Frontend form uses:
        latitude / longitude

      So support BOTH formats.
    */

    const latitude =
      district?.latitude ??
      district?.lat ??
      "";

    const longitude =
      district?.longitude ??
      district?.lng ??
      "";

    setFormData({

      name:
        district?.name || "",

      region:
        district?.region ||
        "Tamil Nadu",

      population:
        district?.population ?? "",

      latitude:
        latitude,

      longitude:
        longitude,

      risk_level:
        district?.risk_level ||
        "LOW",

    });

    setError("");
    setShowForm(true);

  };


  // ==========================================
  // FORM INPUT CHANGE
  // ==========================================

  const handleFormChange = (
    event
  ) => {

    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

  };


  // ==========================================
  // SAVE DISTRICT
  // ADD / UPDATE
  // ==========================================

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    try {

      setError("");

      const payload = {

        name:
          formData.name.trim(),

        region:
          formData.region.trim(),

        population:
          Number(
            formData.population
          ),

        latitude:
          Number(
            formData.latitude
          ),

        longitude:
          Number(
            formData.longitude
          ),

        risk_level:
          formData.risk_level,

      };


      // ======================================
      // VALIDATION
      // ======================================

      if (!payload.name) {

        setError(
          "District name is required."
        );

        return;

      }


      if (!payload.region) {

        setError(
          "Region is required."
        );

        return;

      }


      if (
        !Number.isFinite(
          payload.population
        ) ||
        payload.population <= 0
      ) {

        setError(
          "Valid population is required."
        );

        return;

      }


      if (
        !Number.isFinite(
          payload.latitude
        ) ||
        payload.latitude < -90 ||
        payload.latitude > 90
      ) {

        setError(
          "Valid latitude is required (-90 to 90)."
        );

        return;

      }


      if (
        !Number.isFinite(
          payload.longitude
        ) ||
        payload.longitude < -180 ||
        payload.longitude > 180
      ) {

        setError(
          "Valid longitude is required (-180 to 180)."
        );

        return;

      }


      // ======================================
      // UPDATE
      // ======================================

      if (editingDistrict) {

        await districtService
          .updateDistrict(
            editingDistrict._id,
            payload
          );

      }

      // ======================================
      // CREATE
      // ======================================

      else {

        await districtService
          .createDistrict(
            payload
          );

      }


      // ======================================
      // RESET FORM
      // ======================================

      setShowForm(false);

      setEditingDistrict(null);

      setFormData(
        getEmptyForm()
      );


      await loadData();

    } catch (err) {

      console.error(
        "District Save Error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Failed to save district."
      );

    }

  };


  // ==========================================
  // CANCEL FORM
  // ==========================================

  const handleCancel = () => {

    setShowForm(false);

    setEditingDistrict(null);

    setFormData(
      getEmptyForm()
    );

    setError("");

  };


  // ==========================================
  // DELETE DISTRICT
  // ADMIN ONLY
  // ==========================================

  const handleDelete = async (
    id
  ) => {

    const confirmed =
      window.confirm(
        "Delete this district?"
      );

    if (!confirmed) {

      return;

    }

    try {

      setError("");

      await districtService
        .deleteDistrict(id);

      await loadData();

    } catch (err) {

      console.error(
        "District Delete Error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Failed to delete district."
      );

    }

  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="
        p-6
        text-white
      ">

        Loading districts...

      </div>

    );

  }


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="
      p-6
      space-y-6
    ">


      {/* ======================================
          HEADER
      ====================================== */}

      <div>

        <h1 className="
          text-3xl
          font-bold
          text-white
        ">

          District Management

        </h1>

        <p className="
          text-slate-400
          mt-1
        ">

          Manage district information
          and risk status.

        </p>

      </div>


      {/* ======================================
          ERROR
      ====================================== */}

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


      {/* ======================================
          STATISTICS
      ====================================== */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-4
        gap-4
      ">


        {/* TOTAL */}

        <div className="
          bg-slate-800
          rounded-xl
          p-4
        ">

          <p className="
            text-slate-400
          ">

            Total Districts

          </p>

          <p className="
            text-3xl
            font-bold
            text-white
          ">

            {
              stats?.totalDistricts || 0
            }

          </p>

        </div>


        {/* HIGH */}

        <div className="
          bg-red-900
          rounded-xl
          p-4
        ">

          <p className="
            text-red-200
          ">

            High Risk

          </p>

          <p className="
            text-3xl
            font-bold
            text-white
          ">

            {
              stats?.highRiskDistricts || 0
            }

          </p>

        </div>


        {/* MEDIUM */}

        <div className="
          bg-yellow-700
          rounded-xl
          p-4
        ">

          <p className="
            text-yellow-100
          ">

            Medium Risk

          </p>

          <p className="
            text-3xl
            font-bold
            text-white
          ">

            {
              stats?.mediumRiskDistricts || 0
            }

          </p>

        </div>


        {/* LOW */}

        <div className="
          bg-green-700
          rounded-xl
          p-4
        ">

          <p className="
            text-green-100
          ">

            Low Risk

          </p>

          <p className="
            text-3xl
            font-bold
            text-white
          ">

            {
              stats?.lowRiskDistricts || 0
            }

          </p>

        </div>

      </div>


      {/* ======================================
          ADD DISTRICT BUTTON
      ====================================== */}

      {userRole === "admin" && (

        <div className="
          flex
          justify-end
        ">

          <button
            type="button"
            onClick={handleAdd}
            className="
              bg-cyan-600
              hover:bg-cyan-700
              text-white
              px-5
              py-3
              rounded-lg
              font-semibold
              transition
            "
          >

            + Add District

          </button>

        </div>

      )}


      {/* ======================================
          ADD / EDIT FORM
      ====================================== */}

      {showForm &&
        userRole === "admin" && (

        <div className="
          bg-slate-800
          border
          border-slate-700
          rounded-xl
          p-6
        ">

          <h2 className="
            text-xl
            font-semibold
            text-white
            mb-5
          ">

            {
              editingDistrict
                ? "Edit District"
                : "Add District"
            }

          </h2>


          <form
            onSubmit={handleSubmit}
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
            "
          >


            {/* DISTRICT NAME */}

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="District Name"
              className="
                bg-slate-900
                border
                border-slate-700
                rounded-lg
                px-4
                py-3
                text-white
                outline-none
                focus:border-cyan-500
              "
              required
            />


            {/* REGION */}

            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleFormChange}
              placeholder="Region"
              className="
                bg-slate-900
                border
                border-slate-700
                rounded-lg
                px-4
                py-3
                text-white
                outline-none
                focus:border-cyan-500
              "
              required
            />


            {/* POPULATION */}

            <input
              type="number"
              name="population"
              value={formData.population}
              onChange={handleFormChange}
              placeholder="Population"
              min="1"
              className="
                bg-slate-900
                border
                border-slate-700
                rounded-lg
                px-4
                py-3
                text-white
                outline-none
                focus:border-cyan-500
              "
              required
            />


            {/* LATITUDE */}

            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleFormChange}
              placeholder="Latitude"
              min="-90"
              max="90"
              className="
                bg-slate-900
                border
                border-slate-700
                rounded-lg
                px-4
                py-3
                text-white
                outline-none
                focus:border-cyan-500
              "
              required
            />


            {/* LONGITUDE */}

            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleFormChange}
              placeholder="Longitude"
              min="-180"
              max="180"
              className="
                bg-slate-900
                border
                border-slate-700
                rounded-lg
                px-4
                py-3
                text-white
                outline-none
                focus:border-cyan-500
              "
              required
            />


            {/* RISK */}

            <select
              name="risk_level"
              value={formData.risk_level}
              onChange={handleFormChange}
              className="
                bg-slate-900
                border
                border-slate-700
                rounded-lg
                px-4
                py-3
                text-white
                outline-none
                focus:border-cyan-500
              "
            >

              <option value="LOW">
                LOW
              </option>

              <option value="MEDIUM">
                MEDIUM
              </option>

              <option value="HIGH">
                HIGH
              </option>

              <option value="CRITICAL">
                CRITICAL
              </option>

            </select>


            {/* FORM BUTTONS */}

            <div className="
              md:col-span-2
              flex
              justify-end
              gap-3
            ">

              <button
                type="button"
                onClick={handleCancel}
                className="
                  bg-slate-600
                  hover:bg-slate-500
                  text-white
                  px-5
                  py-2
                  rounded-lg
                "
              >

                Cancel

              </button>


              <button
                type="submit"
                className="
                  bg-cyan-600
                  hover:bg-cyan-700
                  text-white
                  px-5
                  py-2
                  rounded-lg
                  font-semibold
                "
              >

                {
                  editingDistrict
                    ? "Update District"
                    : "Save District"
                }

              </button>

            </div>

          </form>

        </div>

      )}


      {/* ======================================
          SEARCH + FILTER
      ====================================== */}

      <div className="
        flex
        flex-col
        md:flex-row
        gap-4
      ">


        {/* SEARCH */}

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          onKeyDown={(event) => {

            if (
              event.key === "Enter"
            ) {

              handleSearch();

            }

          }}
          placeholder="Search district..."
          className="
            flex-1
            bg-slate-800
            border
            border-slate-700
            rounded-lg
            px-4
            py-2
            text-white
          "
        />


        {/* SEARCH BUTTON */}

        <button
          type="button"
          onClick={handleSearch}
          className="
            bg-cyan-600
            hover:bg-cyan-700
            text-white
            px-6
            py-2
            rounded-lg
          "
        >

          Search

        </button>


        {/* RISK FILTER */}

        <select
          value={riskFilter}
          onChange={(event) =>
            handleRiskFilter(
              event.target.value
            )
          }
          className="
            bg-slate-800
            text-white
            border
            border-slate-700
            rounded-lg
            px-4
            py-2
          "
        >

          <option value="ALL">
            All Risk Levels
          </option>

          <option value="HIGH">
            High
          </option>

          <option value="MEDIUM">
            Medium
          </option>

          <option value="LOW">
            Low
          </option>

          <option value="CRITICAL">
            Critical
          </option>

        </select>

      </div>


      {/* ======================================
          DISTRICT TABLE
      ====================================== */}

      <div className="
        bg-slate-800
        rounded-xl
        overflow-x-auto
      ">

        <table className="
          w-full
        ">

          {/* TABLE HEADER */}

          <thead className="
            bg-slate-700
            text-slate-300
          ">

            <tr>

              <th className="
                p-4
                text-left
              ">
                District
              </th>

              <th className="
                p-4
                text-left
              ">
                Region
              </th>

              <th className="
                p-4
                text-left
              ">
                Population
              </th>

              <th className="
                p-4
                text-left
              ">
                Risk
              </th>

              <th className="
                p-4
                text-left
              ">
                Alerts
              </th>

              {userRole === "admin" && (

                <th className="
                  p-4
                  text-left
                ">
                  Actions
                </th>

              )}

            </tr>

          </thead>


          {/* TABLE BODY */}

          <tbody>

            {districts.map(
              (district) => (

                <tr
                  key={
                    district._id
                  }
                  className="
                    border-t
                    border-slate-700
                    text-white
                  "
                >

                  {/* DISTRICT */}

                  <td className="p-4">

                    {
                      district.name
                    }

                  </td>


                  {/* REGION */}

                  <td className="p-4">

                    {
                      district.region
                    }

                  </td>


                  {/* POPULATION */}

                  <td className="p-4">

                    {
                      Number(
                        district.population || 0
                      ).toLocaleString()
                    }

                  </td>


                  {/* RISK */}

                  <td className="p-4">

                    <span className="
                      font-semibold
                    ">

                      {
                        district.risk_level
                      }

                    </span>

                  </td>


                  {/* ALERTS */}

                  <td className="p-4">

                    {
                      district.active_alerts || 0
                    }

                  </td>


                  {/* ACTIONS */}

                  {userRole === "admin" && (

                    <td className="
                      p-4
                      whitespace-nowrap
                    ">

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(
                            district
                          )
                        }
                        className="
                          bg-cyan-600
                          hover:bg-cyan-700
                          text-white
                          px-3
                          py-1
                          rounded
                          mr-2
                        "
                      >

                        Edit

                      </button>


                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            district._id
                          )
                        }
                        className="
                          bg-red-600
                          hover:bg-red-700
                          text-white
                          px-3
                          py-1
                          rounded
                        "
                      >

                        Delete

                      </button>

                    </td>

                  )}

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>


      {/* ======================================
          EMPTY STATE
      ====================================== */}

      {districts.length === 0 && (

        <div className="
          text-center
          text-slate-400
          py-8
        ">

          No districts found.

        </div>

      )}

    </div>

  );

}
