import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders TechNova Sentinel AI", () => {
  render(<App />);

  expect(
    screen.getByText("TechNova Sentinel AI")
  ).toBeInTheDocument();

  expect(
    screen.getByText("Disease Surge Prediction System")
  ).toBeInTheDocument();
});

test("renders login form", () => {
  render(<App />);

  expect(
    screen.getByPlaceholderText("Enter your email")
  ).toBeInTheDocument();

  expect(
    screen.getByPlaceholderText("Enter your password")
  ).toBeInTheDocument();

  expect(
    screen.getByRole("button", { name: "Login" })
  ).toBeInTheDocument();
});

test("renders register option", () => {
  render(<App />);

  expect(
    screen.getByRole("button", { name: "Register" })
  ).toBeInTheDocument();
});
