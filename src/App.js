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
import ResourcePlanning from "./pages/ResourcePlanning";
import Alerts from "./components/ASHAAlertGenerator";
import About from "./pages/About";
import AIRecommendations from "./pages/AIRecommendations";

import ValidationScorecard from "./components/ValidationScorecard";
import ShapFeatureChart from "./components/ShapFeatureChart";
import DataSourcePanel from "./components/DataSourcePanel";

import Login from "./pages/Login";
import Register from "./pages/Register";


import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";

import RoleProtectedPage
  from "./components/auth/RoleProtectedPage";


// ============================================
// LOGIN PROTECTION
// ============================================

function ProtectedRoute({
  children,
}) {

  const {
    user,
    loading,
  } = useAuth();


  if (loading) {

    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

        Loading...

      </div>
    );

  }


  if (!user) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  return children;

}


// ============================================
// MAIN APP CONTENT
// ============================================

function AppContent() {

  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "dashboard"
  );


  const [
    time,
    setTime,
  ] = useState(
    new Date()
  );


  const [
    predictionData,
    setPredictionData,
  ] = useState([]);


  const [
    selectedPrediction,
    setSelectedPrediction,
  ] = useState(null);


  // ============================================
  // LIVE CLOCK
  // ============================================

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


    return () =>
      clearInterval(
        timer
      );

  }, []);


  // ============================================
  // RISK COUNTS
  // ============================================

  const highCount =
    predictionData.filter(
      (item) =>
        item?.risk_level === "HIGH"
    ).length;


  const medCount =
    predictionData.filter(
      (item) =>
        item?.risk_level === "MEDIUM"
    ).length;


  // ============================================
  // AI RECOMMENDATION
  // ============================================

  const handleRecommend =
    (prediction) => {

      setSelectedPrediction(
        prediction
      );

      setActiveTab(
        "ai-recommendations"
      );

    };


  // ============================================
  // PAGE RENDERING
  // ============================================

  const renderPage = () => {

    switch (
      activeTab
    ) {


      // ========================================
      // ALL USERS
      // ========================================

      case "dashboard":

        return (

          <RoleProtectedPage
            allowedRoles={[
              "admin",
              "health_officer",
              "viewer",
            ]}
          >

            <Dashboard />

          </RoleProtectedPage>

        );


      case "predictions":

        return (

          <RoleProtectedPage
            allowedRoles={[
              "admin",
              "health_officer",
              "viewer",
            ]}
          >

            <Prediction
              onRecommend={
                handleRecommend
              }
            />

          </RoleProtectedPage>

        );


      case "district-analysis":

        return (

          <RoleProtectedPage
            allowedRoles={[
              "admin",
              "health_officer",
              "viewer",
            ]}
          >

            <DistrictAnalysis
              data={
                predictionData
              }
            />

          </RoleProtectedPage>

        );


      case "about":

        return (

          <RoleProtectedPage
            allowedRoles={[
              "admin",
              "health_officer",
              "viewer",
            ]}
          >

            <About />

          </RoleProtectedPage>

        );


      // ========================================
      // ADMIN + HEALTH OFFICER
      // ========================================

      case "ai-recommendations":

        return (

          <RoleProtectedPage
            allowedRoles={[
              "admin",
              "health_officer",
            ]}
          >

            <AIRecommendations
              prediction={
                selectedPrediction
              }
            />

          </RoleProtectedPage>

        );


      case "alerts":

        return (

          <RoleProtectedPage
            allowedRoles={[
              "admin",
              "health_officer",
            ]}
          >

            <Alerts
              data={
                predictionData
              }
            />

          </RoleProtectedPage>

        );


      // ========================================
      // ADMIN ONLY
      // ========================================

      case "validation-scorecard":

        return (

          <RoleProtectedPage
            allowedRoles={[
              "admin",
            ]}
          >

            <ValidationScorecard />

          </RoleProtectedPage>

        );


      case "shap-analysis":

        return (

          <RoleProtectedPage
            allowedRoles={[
              "admin",
            ]}
          >

            <ShapFeatureChart />

          </RoleProtectedPage>

        );


      case "resource-planning":

        return (

          <RoleProtectedPage
            allowedRoles={[
              "admin",
            ]}
          >

            <ResourcePlanning
              data={
                predictionData
              }
            />

          </RoleProtectedPage>

        );


      case "data-sources":

        return (

          <RoleProtectedPage
            allowedRoles={[
              "admin",
            ]}
          >

            <DataSourcePanel />

          </RoleProtectedPage>

        );


      // ========================================
      // DEFAULT
      // ========================================

      default:

        return (
          <Dashboard />
        );

    }

  };


  // ============================================
  // LAYOUT
  // ============================================

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
        medCount
      }

    >

      {renderPage()}

    </DashboardLayout>

  );

}


// ============================================
// APP
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
              <Login />
            }

          />

          <Route

  path="/register"

  element={
    <Register />
  }

/>


          {/* PROTECTED APP */}

          <Route

            path="/*"

            element={

              <ProtectedRoute>

                <AppContent />

              </ProtectedRoute>

            }

          />


        </Routes>

      </AuthProvider>

    </BrowserRouter>

  );

}


export default App;