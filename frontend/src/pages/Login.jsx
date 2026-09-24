import React, {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import {
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import "./Login.css";


export default function Login() {

  const navigate =
    useNavigate();


  const {
    login,
  } = useAuth();


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    showPassword,
    setShowPassword,
  ] = useState(false);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  // ============================================
  // LOGIN
  // ============================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setError("");

      setLoading(true);


      try {

        await login(
          email,
          password
        );

        navigate(
          "/"
        );

      } catch (error) {

        setError(
          error.message ||
          "Login failed"
        );

      } finally {

        setLoading(false);

      }

    };


  return (

    <div className="auth-page">

      <div className="auth-card">


        {/* HEADER */}

        <div className="auth-header">

          <div className="auth-icon">

            🛡️

          </div>


          <h1>

            TechNova Sentinel AI

          </h1>


          <p>

            Disease Surge Prediction System

          </p>

        </div>


        {/* ERROR */}

        {

          error && (

            <div className="auth-error">

              {error}

            </div>

          )

        }


        {/* FORM */}

        <form
          onSubmit={handleSubmit}
        >


          {/* EMAIL */}

          <div className="auth-field">

            <label>

              Email Address

            </label>


            <input

              type="email"

              placeholder="Enter your email"

              value={email}

              onChange={
                (e) =>
                  setEmail(
                    e.target.value
                  )
              }

              required

            />

          </div>


          {/* PASSWORD */}

          <div className="auth-field">

            <label>

              Password

            </label>


            <div className="password-wrapper">

              <input

                type={
                  showPassword
                    ? "text"
                    : "password"
                }

                placeholder="Enter your password"

                value={password}

                onChange={
                  (e) =>
                    setPassword(
                      e.target.value
                    )
                }

                required

              />


              <button

                type="button"

                className="password-toggle"

                onClick={
                  () =>
                    setShowPassword(
                      !showPassword
                    )
                }

              >

                {

                  showPassword

                    ? <FaEyeSlash />

                    : <FaEye />

                }

              </button>

            </div>

          </div>


          {/* SUBMIT */}

          <button

            className="auth-button"

            type="submit"

            disabled={loading}

          >

            {

              loading

                ? "Logging in..."

                : "Login"

            }

          </button>


        </form>


        {/* REGISTER */}

        <div className="auth-footer">

          Don't have an account?

          <button

            type="button"

            onClick={
              () =>
                navigate(
                  "/register"
                )
            }

          >

            Register

          </button>

        </div>


      </div>

    </div>

  );

}
