import axios from "axios";


// ============================================
// AUTH API CONFIGURATION
// ============================================

const AUTH_API =
  axios.create({

    baseURL:
      "http://localhost:5000/api",

    headers: {

      "Content-Type":
        "application/json",

    },

  });


// ============================================
// LOGIN
// ============================================

export const loginUser =
  async (
    email,
    password
  ) => {

    const response =
      await AUTH_API.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

    return response.data;

  };


// ============================================
// REGISTER
// ============================================

export const registerUser =
  async (
    userData
  ) => {

    const response =
      await AUTH_API.post(
        "/auth/register",
        userData
      );

    return response.data;

  };


// ============================================
// GET PROFILE
// ============================================

export const getProfile =
  async (
    token
  ) => {

    const response =
      await AUTH_API.get(
        "/auth/profile",
        {
          headers: {

            Authorization:
              `Bearer ${token}`,

          },
        }
      );

    return response.data;

  };


// ============================================
// REFRESH TOKEN
// ============================================

export const refreshAccessToken =
  async (
    refreshToken
  ) => {

    const response =
      await AUTH_API.post(
        "/auth/refresh",
        {
          refreshToken,
        }
      );

    return response.data;

  };


// ============================================
// LOGOUT
// ============================================

export const logoutUser =
  async (
    refreshToken
  ) => {

    const response =
      await AUTH_API.post(
        "/auth/logout",
        {
          refreshToken,
        }
      );

    return response.data;

  };


// ============================================
// FORGOT PASSWORD
// ============================================

export const forgotPassword =
  async (
    email
  ) => {

    const response =
      await AUTH_API.post(
        "/auth/forgot-password",
        {
          email,
        }
      );

    return response.data;

  };


// ============================================
// RESET PASSWORD
// ============================================

export const resetPassword =
  async (
    token,
    password
  ) => {

    const response =
      await AUTH_API.post(
        "/auth/reset-password",
        {
          token,
          password,
        }
      );

    return response.data;

  };


export default AUTH_API;
