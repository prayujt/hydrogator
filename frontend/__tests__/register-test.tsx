import React, { ReactNode } from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import RegisterScreen from "../app/(tabs)/register";
import { API_HOST } from "../constants/vars";

// Mock dependencies
jest.mock("expo-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <>{children}</>,
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock("../constants/vars", () => ({
  API_HOST: "http://localhost:3000",
}));

// Mock react-native-svg components to prevent rendering issues
jest.mock("react-native-svg", () => ({
  Svg: "Svg",
  Circle: "Circle",
  Path: "Path",
  Rect: "Rect",
  G: "G",
  Text: "Text",
  Line: "Line",
  Polygon: "Polygon",
  Polyline: "Polyline",
  Ellipse: "Ellipse",
}));

describe("RegisterScreen", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Successful Registration Test
  it("should register successfully with valid inputs", async () => {
    // Mock successful fetch response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ message: "Registration successful" }),
      } as Response)
    );

    const { getByTestId } = render(<RegisterScreen />);

    // Fill in valid inputs
    const usernameInput = getByTestId("usernameInput");
    const emailInput = getByTestId("emailInput");
    const passwordInput = getByTestId("passwordInput");
    const registerButton = getByTestId("registerButton");

    fireEvent.changeText(usernameInput, "validuser123");
    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "ValidPass123");
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`${API_HOST}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          username: "validuser123",
          password: "ValidPass123",
        }),
      });
    });
  });

  // Username Validation Tests
  describe("Username Validation", () => {
    it("should show error for invalid username (too short)", async () => {
      const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

      const usernameInput = getByPlaceholderText("Enter your username");
      fireEvent.changeText(usernameInput, "us");

      expect(
        getByText("Username must be between 3 and 20 alphanumeric characters.")
      ).toBeTruthy();
    });

    it("should show error for username with invalid characters", async () => {
      const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

      const usernameInput = getByPlaceholderText("Enter your username");
      fireEvent.changeText(usernameInput, "user!@#");

      expect(
        getByText("Username must be between 3 and 20 alphanumeric characters.")
      ).toBeTruthy();
    });
  });

  // Email Validation Tests
  describe("Email Validation", () => {
    it("should show error for invalid email format", async () => {
      const { getByTestId, getByText } = render(<RegisterScreen />);

      const emailInput = getByTestId("emailInput");
      fireEvent.changeText(emailInput, "invalidemail");

      expect(getByText("Enter a valid email address.")).toBeTruthy();
    });

    it("should accept valid email formats", async () => {
      const { getByTestId, queryByText } = render(<RegisterScreen />);

      const emailInput = getByTestId("emailInput");
      fireEvent.changeText(emailInput, "valid.email123@example.com");

      expect(queryByText("Enter a valid email address.")).toBeNull();
    });
  });

  // Password Validation Tests
  describe("Password Validation", () => {
    it("should show error for password without uppercase letter", async () => {
      const { getByText } = render(<RegisterScreen />);

      const passwordInput = getByTestId("passwordInput");
      fireEvent.changeText(passwordInput, "password123");

      expect(
        getByText(
          "Password must be between 8 and 20 characters and contain one uppercase letter, one lowercase letter, and one number."
        )
      ).toBeTruthy();
    });

    it("should show error for password without number", async () => {
      const { getByTestId, getByText } = render(<RegisterScreen />);

      const passwordInput = getByTestId("passwordInput");
      fireEvent.changeText(passwordInput, "Password");

      expect(
        getByText(
          "Password must be between 8 and 20 characters and contain one uppercase letter, one lowercase letter, and one number."
        )
      ).toBeTruthy();
    });
  });

  // Registration Failure Test
  it("should handle registration failure", async () => {
    // Mock failed fetch response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: "Registration failed" }),
      } as Response)
    );

    const { getByTestId } = render(<RegisterScreen />);

    const usernameInput = getByTestId("usernameInput");
    const emailInput = getByTestId("emailInput");
    const passwordInput = getByTestId("passwordInput");
    const registerButton = getByTestId("registerButton");

    fireEvent.changeText(usernameInput, "validuser123");
    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "ValidPass123");
    fireEvent.press(registerButton);

    // Wait for the error alert
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  // Network Error Test
  it("should handle network errors during registration", async () => {
    // Mock network error
    global.fetch = jest.fn(() => Promise.reject(new Error("Network error")));

    const { getByTestId } = render(<RegisterScreen />);

    const usernameInput = getByTestId("usernameInput");
    const emailInput = getByTestId("emailInput");
    const passwordInput = getByTestId("passwordInput");
    const registerButton = getByTestId("registerButton");

    fireEvent.changeText(usernameInput, "validuser123");
    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "ValidPass123");
    fireEvent.press(registerButton);

    // Wait for the network error alert
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
