import { useState, useEffect } from "react";

import dashboardService from "../services/dashboardService";


const useDashboard = () => {

  const [dashboardData, setDashboardData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);


  const fetchDashboardData = async () => {

    try {

      setLoading(true);

      setError(null);


      const data = await dashboardService.getSummary();


      setDashboardData(data);


    } catch (err) {

      console.error(
        "Dashboard API Error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        err.message ||
        "Failed to load dashboard data"
      );


    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchDashboardData();

  }, []);


  return {

    dashboardData,

    loading,

    error,

    refreshDashboard:
      fetchDashboardData,

  };

};


export default useDashboard;
