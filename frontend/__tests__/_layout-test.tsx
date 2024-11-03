import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import TabsLayout from "../app/(tabs)/_layout";
import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("expo-router", () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useRootNavigationState: jest.fn().mockReturnValue({ key: "index" }),
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => {
  return {
    getItem: jest.fn(),
    setItem: jest.fn(),
  };
});

jest.mock("@expo/vector-icons", () => {
  return {
    Ionicons: () => <div data-testid="ionicon" />,
  };
});

describe("TabsLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show appropriate tabs when user is signed in", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("token"); // Mock token presence

    /* const { queryByText } = render(<TabsLayout />); */
    const { getByTestId } = render(<TabsLayout />);

    await waitFor(() => {
      // Check that "Home" and "Account" tabs are present
      expect(getByTestId("homeTab")).toBeTruthy();
      expect(getByTestId("accountTab")).toBeTruthy();
    });
  });

  it("should show Sign In and Register tabs when user is not signed in", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null); // Mock no token presence

    const { queryByText } = render(<TabsLayout />);

    await waitFor(() => {
      // Check that "Sign In" and "Register" tabs are present
      expect(queryByText("Sign In")).toBeTruthy();
      expect(queryByText("Register")).toBeTruthy();
    });
  });

  it("should handle errors gracefully if AsyncStorage fails", async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
      new Error("AsyncStorage error")
    );

    const { queryByText } = render(<TabsLayout />);

    await waitFor(() => {
      // Default to user being signed out if AsyncStorage errors
      expect(queryByText("Sign In")).toBeTruthy();
      expect(queryByText("Register")).toBeTruthy();
    });
  });

  it("should render correct icons for each tab based on route and focus", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("token");

    const { getByTestId } = render(<TabsLayout />);

    await waitFor(() => {
      // Verify icon rendering by checking for an element with data-testid="icon"
      expect(getByTestId("icon")).toBeTruthy();
    });
  });
});
