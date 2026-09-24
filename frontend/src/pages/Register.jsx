import React, {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import "./Login.css";

export default function Register() {

  const navigate =
    useNavigate();


  const {
    register,
  } = useAuth();


  // ============================================
  // FORM STATES
  // ============================================

  const [
    name,
    setName,
  ] = useState("");


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    role,
    setRole,
  ] = useState("viewer");


  const [
    district,
    setDistrict,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  // ============================================
  // REGISTER
  // ============================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setError("");
      setSuccess("");

      setLoading(true);


      try {

        const userData = {

          name,

          email,

          password,

          role,

          district:
            role === "health_officer"
              ? district
              : null,

        };


        const response =
          await register(
            userData
          );


        setSuccess(
          response.message ||
          "Registration successful!"
        );


        setTimeout(
          () => {

            navigate(
              "/login"
            );

          },
          1500
        );


      } catch (error) {

        setError(
          error.message ||
          "Registration failed"
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

            Create Account

          </h1>


          <p>

            TechNova Sentinel AI

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


        {/* SUCCESS */}

        {

          success && (

            <div className="auth-success">

              {success}

            </div>

          )

        }


        {/* FORM */}

        <form
          onSubmit={handleSubmit}
        >


          {/* NAME */}

          <div className="auth-field">

            <label>

              Full Name

            </label>


            <input

              type="text"

              placeholder="Enter your full name"

              value={name}

              onChange={
                (e) =>
                  setName(
                    e.target.value
                  )
              }

              required

            />

          </div>


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


            <input

              type="password"

              placeholder="Minimum 6 characters"

              value={password}

              onChange={
                (e) =>
                  setPassword(
                    e.target.value
                  )
              }

              minLength="6"

              required

            />

          </div>


          {/* ROLE */}

          <div className="auth-field">

            <label>

              Role

            </label>


            <select

              value={role}

              onChange={
                (e) =>
                  setRole(
                    e.target.value
                  )
              }

            >

              <option value="viewer">

                Viewer

              </option>


              <option value="health_officer">

                Health Officer

              </option>

            </select>

          </div>


          {/* DISTRICT */}

          {

            role === "health_officer" && (

              <div className="auth-field">

                <label>

                  District

                </label>


                <input

                  type="text"

                  placeholder="Enter district name"

                  value={district}

                  onChange={
                    (e) =>
                      setDistrict(
                        e.target.value
                      )
                  }

                  required

                />

              </div>

            )

          }


          {/* SUBMIT */}

          <button

            className="auth-button"

            type="submit"

            disabled={loading}

          >

            {

              loading

                ? "Creating Account..."

                : "Create Account"

            }

          </button>


        </form>


        {/* LOGIN LINK */}

        <div className="auth-footer">

          Already have an account?

          <button

            type="button"

            onClick={
              () =>
                navigate(
                  "/login"
                )
            }

          >

            Login

          </button>

        </div>


      </div>

    </div>

  );

}
