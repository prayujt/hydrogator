import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import MapScreen from "../app/(tabs)/index";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_HOST } from "../constants/vars";

// Mock the BottomSheetModalProvider
jest.mock("@gorhom/bottom-sheet", () => ({
  BottomSheetModalProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  BottomSheet: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the router to avoid navigation errors
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
}));

jest.mock("mapbox-gl", () => ({
  Map: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    remove: jest.fn(),
    addControl: jest.fn(),
    easeTo: jest.fn(),
  })),
  NavigationControl: jest.fn(),
  GeolocateControl: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
  })),
}));

// Mock AsyncStorage to simulate user token
beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
  // (AsyncStorage.getItem as jest.Mock).mockResolvedValue('mockedToken');
});

afterEach(() => {});

describe("MapScreen", () => {
  it("should render the map container", () => {
    const { getByTestId } = render(<MapScreen />);
    expect(getByTestId("mapContainer")).toBeTruthy();
  });

  it("should fetch buildings on mount", async () => {
    await act(async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        redirected: false,
        url: `${API_HOST}/buildings`,
        json: async () => [
          {
            id: "1",
            name: "Building 1",
            fountainCount: 3,
            latitude: -82.35,
            longitude: 29.645,
          },
        ],
      });

      global.fetch = mockFetch;
      render(<MapScreen />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          `${API_HOST}/buildings`,
          expect.anything()
        );
      });

      // Optional: Log fetch calls for debugging
      console.log("Fetch calls:", mockFetch.mock.calls);
    });
  });

  it("should display BottomSheet with building details when a building is selected", async () => {
    const mockBuilding = {
      id: "1",
      name: "Building 1",
      fountainCount: 3,
      latitude: -82.35,
      longitude: 29.645,
    };

    // Mock fetch response for fountains when a building is selected
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: "1", floor: 1, description: "First Floor Fountain" },
      ],
    });

    const { getByText, queryByText, getByTestId } = render(<MapScreen />);

    // Simulate building selection to open BottomSheet
    await act(async () => {
      // Mock setting selectedBuilding state to show BottomSheet
      fireEvent.press(getByTestId("mapContainer")); // Replace this with the actual way a building would be selected
    });

    await waitFor(() => {
      expect(queryByText(mockBuilding.name)).toBeTruthy(); // Checks if the BottomSheet shows the building's name
      expect(queryByText("First Floor Fountain")).toBeTruthy(); // Check for fountain detail text
    });
  });

  it("should handle missing token error gracefully", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null); // Simulate no token

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    render(<MapScreen />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(new Error("no token found"));
    });

    consoleErrorSpy.mockRestore();
  });

  it("should handle network errors gracefully", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    render(<MapScreen />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(new Error("Network error"));
    });

    consoleErrorSpy.mockRestore();
  });
});
