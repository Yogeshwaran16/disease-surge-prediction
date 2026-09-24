import React, {
  useState,
  useEffect,
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Prediction from "./pages/Prediction";
import DistrictAnalysis from "./pages/DistrictAnalysis";
import DistrictManagement from "./pages/DistrictManagement";
import ResourcePlanning from "./pages/ResourcePlanning";
import About from "./pages/About";
import AIRecommendations from "./pages/AIRecommendations";
import FeatureStoreExplorer
from "./pages/FeatureStoreExplorer";

import Alerts from "./components/ASHAAlertGenerator";
import AlertHistory from "./pages/AlertHistory";

import RoleProtected from "./components/auth/RoleProtected";

import {
  PAGE_PERMISSIONS,
} from "./config/permissions";

import ValidationScorecard from "./components/ValidationScorecard";
import ShapFeatureChart from "./components/ShapFeatureChart";
import DataSourcePanel from "./components/DataSourcePanel";
import ReportsCenter from "./pages/ReportsCenter";

import Login from "./pages/Login";

import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";
import AgentMonitoring from "./pages/AgentMonitoring";


// ============================================
// PROTECTED APPLICATION
// ============================================

function ProtectedApp() {

  const {
    isAuthenticated,
    loading,
  } = useAuth();


  // ==========================================
  // AUTH LOADING
  // ==========================================

  if (loading) {

    return (

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          fontWeight: "600",
        }}
      >

        Loading TechNova Sentinel AI...

      </div>

    );

  }


  // ==========================================
  // LOGIN PROTECTION
  // ==========================================

  if (!isAuthenticated) {

    return (

      <Navigate
        to="/login"
        replace
      />

    );

  }


  return (

    <AppContent />

  );

}


// ============================================
// LOGIN PAGE
// ============================================

function LoginPage() {

  const {
    isAuthenticated,
    loading,
  } = useAuth();


  if (loading) {

    return (

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >

        Loading...

      </div>

    );

  }


  if (isAuthenticated) {

    return (

      <Navigate
        to="/"
        replace
      />

    );

  }


  return (

    <Login />

  );

}


// ============================================
// MAIN APP CONTENT
// ============================================

function AppContent() {


  // ==========================================
  // ACTIVE PAGE
  // ==========================================

  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "dashboard"
  );

  const [
  selectedDistrict,
  setSelectedDistrict,
] = useState("All");


  // ==========================================
  // LIVE TIME
  // ==========================================

  const [
    time,
    setTime,
  ] = useState(
    new Date()
  );


  // ==========================================
  // PREDICTION DATA
  // ==========================================

  const [
    predictionData,
    setPredictionData,
  ] = useState(
    []
  );


  // ==========================================
  // SELECTED PREDICTION
  // ==========================================

  const [
    selectedPrediction,
    setSelectedPrediction,
  ] = useState(
    null
  );


  // ==========================================
  // LIVE CLOCK
  // ==========================================

  useEffect(() => {

    const timer =
      setInterval(
        () => {

          setTime(
            new Date()
          );

        },
        1000
      );


    return () => {

      clearInterval(
        timer
      );

    };

  }, []);


  // ==========================================
  // RISK COUNTS
  // ==========================================

  const highCount =
    predictionData.filter(
      (item) =>
        item?.risk_level ===
        "HIGH"
    ).length;


  const mediumCount =
    predictionData.filter(
      (item) =>
        item?.risk_level ===
        "MEDIUM"
    ).length;


  const lowCount =
    predictionData.filter(
      (item) =>
        item?.risk_level ===
        "LOW"
    ).length;


  const criticalCount =
    predictionData.filter(
      (item) =>
        item?.risk_level ===
        "CRITICAL"
    ).length;


  // ==========================================
  // AI RECOMMENDATION HANDLER
  // ==========================================

  const handleRecommend =
    (prediction) => {

      console.log(
        "Selected Prediction:",
        prediction
      );


      setSelectedPrediction(
        prediction
      );


      setActiveTab(
        "ai-recommendations"
      );

    };


  // ==========================================
  // RESOURCE PLANNING HANDLER
  // ==========================================

  const handlePlanResources =
    (prediction) => {

      console.log(
        "Resource Planning Prediction:",
        prediction
      );


      // ========================================
      // SAVE SELECTED PREDICTION
      // ========================================

      setSelectedPrediction(
        prediction
      );


      // ========================================
      // NAVIGATE TO RESOURCE PLANNING
      // ========================================

      setActiveTab(
        "resource-planning"
      );

    };

    // ==========================================
// DISTRICT ANALYSIS HANDLER
// ==========================================

const handleDistrictSelect =
  (districtName) => {

    if (!districtName) {
      return;
    }

    setSelectedDistrict(
      districtName
    );

    setActiveTab(
      "district-analysis"
    );

  };

  // ==========================================
  // PAGE RENDERING
  // ==========================================

  const renderPage =
    () => {

      let page;


      switch (activeTab) {


        // ======================================
        // DASHBOARD
        // ======================================

       case "dashboard":
  page = (
    <Dashboard
      onDistrictSelect={
        handleDistrictSelect
      }
    />
  );
  break;
        // ======================================
        // PREDICTIONS
        // ======================================

        case "predictions":

          page = (

            <Prediction

              onRecommend={
                handleRecommend
              }

              onPlanResources={
                handlePlanResources
              }

              onDataLoaded={
                setPredictionData
              }

            />

          );

          break;


        // ======================================
        // AI RECOMMENDATIONS
        // ======================================

        case "ai-recommendations":

          page = (

            <AIRecommendations
              prediction={
                selectedPrediction
              }

              onResourcePlanning={
                handlePlanResources
              }
            />

          );

          break;


        // ======================================
        // DISTRICT ANALYSIS
        // ======================================

        case "district-analysis":

          page = (

            <DistrictAnalysis
  data={
    predictionData
  }
  selectedDistrict={
    selectedDistrict
  }
/>

          );

          break;

case "district-management":
  return (
    <DistrictManagement />
  );

        // ======================================
        // VALIDATION SCORECARD
        // ======================================

        case "validation-scorecard":

          page = (

            <ValidationScorecard />

          );

          break;


        // ======================================
        // SHAP ANALYSIS
        // ======================================

        case "shap-analysis":

          page = (

            <ShapFeatureChart />

          );

          break;


        // ======================================
        // RESOURCE PLANNING
        // ======================================

        case "resource-planning":

          page = (

            <ResourcePlanning

              data={
                predictionData
              }

              prediction={
                selectedPrediction
              }

            />

          );

          break;


        // ======================================
        // DATA SOURCES
        // ======================================

        case "data-sources":

          page = (

            <DataSourcePanel />

          );

          break;


        // ======================================
        // FEATURE STORE EXPLORER ⭐
        // ======================================

        // ======================================
        // MODULE 13 - REPORTS CENTER
        // ======================================

        case "reports":

          page = (

            <ReportsCenter />

          );

          break;
          // ======================================
// MODULE 14 - AGENT MONITORING
// ======================================

case "agents":
    page = (<AgentMonitoring />);
    break;
    
        case "feature-store":

          page = (

            <FeatureStoreExplorer />

          );

          break;


        // ======================================
        // ALERTS
        // ======================================

        case "alerts":

          page = (

            <Alerts
              data={
                predictionData
              }
            />

          );

          break;


        // ======================================
        // ALERT HISTORY
        // ======================================

        case "alert-history":

          page = (

            <AlertHistory />

          );

          break;


        // ======================================
        // ABOUT
        // ======================================

        case "about":

          page = (

            <About />

          );

          break;


        // ======================================
        // DEFAULT
        // ======================================

        default:

          page = (

            <Dashboard />

          );

          break;

      }


      // ==========================================
      // ROLE BASED ACCESS CONTROL
      // ==========================================

      const allowedRoles =
        PAGE_PERMISSIONS[
          activeTab
        ] ||
        PAGE_PERMISSIONS.dashboard;


      return (

        <RoleProtected
          allowedRoles={
            allowedRoles
          }
        >

          {page}

        </RoleProtected>

      );

    };


  // ==========================================
  // DASHBOARD LAYOUT
  // ==========================================

  return (

    <DashboardLayout

      activeTab={
        activeTab
      }

      setActiveTab={
        setActiveTab
      }

      time={
        time
      }

      totalPredictions={
        predictionData.length
      }

      highRisk={
        highCount
      }

      mediumRisk={
        mediumCount
      }

      lowRisk={
        lowCount
      }

      criticalRisk={
        criticalCount
      }

    >

      {renderPage()}

    </DashboardLayout>

  );

}


// ============================================
// MAIN APP
// ============================================

function App() {

  return (

    <BrowserRouter>

      <AuthProvider>

        <Routes>


          {/* LOGIN */}

          <Route
            path="/login"
            element={
              <LoginPage />
            }
          />


          {/* PROTECTED APP */}

          <Route
            path="/*"
            element={
              <ProtectedApp />
            }
          />


        </Routes>

      </AuthProvider>

    </BrowserRouter>

  );

}


export default App;


