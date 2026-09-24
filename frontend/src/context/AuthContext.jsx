import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  registerUser,
  getProfile,
  logoutUser,
} from "../services/authService";


// ============================================
// CREATE CONTEXT
// ============================================

const AuthContext =
  createContext();


// ============================================
// AUTH PROVIDER
// ============================================

export const AuthProvider =
  ({ children }) => {

    const [user, setUser] =
      useState(null);

    const [loading, setLoading] =
      useState(true);


    // ==========================================
    // LOAD SAVED USER
    // ==========================================

    useEffect(() => {

      const loadUser =
        async () => {

          try {

            const token =
              localStorage.getItem(
                "accessToken"
              );


            if (!token) {

              setLoading(false);

              return;

            }


            const response =
              await getProfile(token);


            if (
              response.success
            ) {

              setUser(
                response.user
              );

            }

          } catch (error) {

            console.error(
              "Authentication Error:",
              error
            );


            // Invalid token

            localStorage.removeItem(
              "accessToken"
            );

            localStorage.removeItem(
              "refreshToken"
            );

            localStorage.removeItem(
              "user"
            );

          } finally {

            setLoading(false);

          }

        };


      loadUser();

    }, []);


    // ==========================================
    // LOGIN
    // ==========================================

    const login =
      async (
        email,
        password
      ) => {

        try {

          const response =
            await loginUser(
              email,
              password
            );


          if (
            !response.success
          ) {

            throw new Error(
              response.message ||
              "Login failed"
            );

          }


          // ======================================
          // SAVE TOKENS
          // ======================================

          if (
            response.accessToken
          ) {

            localStorage.setItem(

              "accessToken",

              response.accessToken

            );

          }


          if (
            response.refreshToken
          ) {

            localStorage.setItem(

              "refreshToken",

              response.refreshToken

            );

          }


          // ======================================
          // SAVE USER
          // ======================================

          if (
            response.user
          ) {

            localStorage.setItem(

              "user",

              JSON.stringify(
                response.user
              )

            );


            setUser(
              response.user
            );

          }


          return response;

        } catch (error) {

          throw new Error(

            error.response?.data?.message ||

            error.message ||

            "Login failed"

          );

        }

      };


    // ==========================================
    // REGISTER
    // ==========================================

    const register =
      async (
        userData
      ) => {

        try {

          const response =
            await registerUser(
              userData
            );


          if (
            !response.success
          ) {

            throw new Error(
              response.message ||
              "Registration failed"
            );

          }


          return response;

        } catch (error) {

          throw new Error(

            error.response?.data?.message ||

            error.message ||

            "Registration failed"

          );

        }

      };


    // ==========================================
    // LOGOUT
    // ==========================================

    const logout =
      async () => {

        try {

          const refreshToken =
            localStorage.getItem(
              "refreshToken"
            );


          if (refreshToken) {

            await logoutUser(
              refreshToken
            );

          }

        } catch (error) {

          console.error(
            "Logout Error:",
            error
          );

        } finally {

          // ====================================
          // CLEAR LOCAL STORAGE
          // ====================================

          localStorage.removeItem(
            "accessToken"
          );

          localStorage.removeItem(
            "refreshToken"
          );

          localStorage.removeItem(
            "user"
          );


          setUser(null);

        }

      };


    // ==========================================
    // CONTEXT VALUE
    // ==========================================

    const value = {

      user,

      loading,

      login,

      register,

      logout,

      isAuthenticated:
        !!user,

      role:
        user?.role || null,

    };


    return (

      <AuthContext.Provider
        value={value}
      >

        {children}

      </AuthContext.Provider>

    );

  };


// ============================================
// CUSTOM AUTH HOOK
// ============================================

export const useAuth =
  () => {

    return useContext(
      AuthContext
    );

  };


export default AuthContext;

