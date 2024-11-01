import React, { ReactNode } from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import ForgotPasswordScreen from "../app/(tabs)/forgot-password"; // Adjust import path as needed
import { API_HOST } from "../constants/vars";

// Mock dependencies
jest.mock("expo-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <>{children}</>,
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  RN.Alert.alert = jest.fn();
  return RN;
});

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("ForgotPasswordScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Step 1: Email Submission", () => {
    it("should show error for empty email", async () => {
      const { getByTestId } = render(<ForgotPasswordScreen />);

      const submitButton = getByTestId("submitButton1");

      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(require("react-native").Alert.alert).toHaveBeenCalledWith(
          "Error",
          "Please enter your email address."
        );
      });
    });

    it("should show error for invalid email format", async () => {
      const { getByTestId } = render(<ForgotPasswordScreen />);

      const emailInput = getByTestId("emailInput");
      const submitButton = getByTestId("submitButton1");

      fireEvent.changeText(emailInput, "invalid-email");
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(require("react-native").Alert.alert).toHaveBeenCalledWith(
          "Error",
          "Please enter a valid email address."
        );
      });
    });

    it("should proceed to step 2 with valid email", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: "Reset code sent" }),
      });

      const { getByTestId } = render(<ForgotPasswordScreen />);

      const emailInput = getByTestId("emailInput");
      const submitButton = getByTestId("submitButton1");

      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(`${API_HOST}/generateForgot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "test@example.com" }),
        });

        expect(getByTestId("resetCodeInput")).toBeTruthy();
      });
    });
  });

  describe("Step 2: Reset Code Validation", () => {
    it("should show error for empty reset code", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: "Reset code sent" }),
      });

      const { getByTestId } = render(<ForgotPasswordScreen />);

      // Simulate reaching step 2
      const emailInput = getByTestId("emailInput");
      const submitButton = getByTestId("submitButton1");

      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByTestId("resetCodeInput")).toBeTruthy();
      });

      const codeSubmitButton = getByTestId("submitButton2");
      fireEvent.press(codeSubmitButton);

      await waitFor(() => {
        expect(require("react-native").Alert.alert).toHaveBeenCalledWith(
          "Error",
          "Please enter the 6-digit reset code."
        );
      });
    });

    it("should proceed to step 3 with valid reset code", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ message: "Reset code sent" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ token: "abc123" }),
        });

      const { getByTestId, getByText } = render(<ForgotPasswordScreen />);

      // Simulate reaching step 2
      const emailInput = getByTestId("emailInput");
      const submitButton = getByTestId("submitButton1");

      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByTestId("resetCodeInput")).toBeTruthy();
      });

      // Submit reset code
      const codeInput = getByTestId("resetCodeInput");
      const codeSubmitButton = getByTestId("submitButton2");

      fireEvent.changeText(codeInput, "123456");
      fireEvent.press(codeSubmitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(`${API_HOST}/validateForgot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            code: "123456",
          }),
        });

        expect(getByTestId("newPasswordInput")).toBeTruthy();
      });
    });
  });

  describe("Step 3: Password Reset", () => {
    it("should show error for mismatched passwords", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ message: "Reset code sent" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ token: "abc123" }),
        });

      const { getByText, getByTestId } = render(<ForgotPasswordScreen />);

      // Simulate reaching step 3
      const emailInput = getByTestId("emailInput");
      const submitButton = getByTestId("submitButton1");

      fireEvent.changeText(emailInput, "test@example.com");
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByTestId("resetCodeInput")).toBeTruthy();
      });

      const codeInput = getByTestId("resetCodeInput");
      const codeSubmitButton = getByTestId("submitButton2");

      fireEvent.changeText(codeInput, "123456");
      fireEvent.press(codeSubmitButton);

      await waitFor(() => {
        expect(getByTestId("newPasswordInput")).toBeTruthy();
      });

      // Try to reset password with mismatched passwords
      const newPasswordInput = getByTestId("newPasswordInput");
      const confirmPasswordInput = getByTestId("confirmPasswordInput");
      const resetButton = getByTestId("submitButton3");

      fireEvent.changeText(newPasswordInput, "password123");
      fireEvent.changeText(confirmPasswordInput, "differentpassword");
      fireEvent.press(resetButton);

      await waitFor(() => {
        expect(require("react-native").Alert.alert).toHaveBeenCalledWith(
          "Error",
          "Passwords do not match."
        );
      });
    });
  });
});
