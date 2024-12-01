import { ReactNode } from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { API_HOST } from "@/constants/vars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EditProfileScreen from "@/app/(tabs)/edit-profile";

jest.mock("react-native-svg", () => {
  return {
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
  };
});

jest.mock("expo-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <>{children}</>,
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
}));

jest.mock("../constants/vars", () => ({
  API_HOST: "http://localhost:3000",
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("EditProfileScreen", () => {
  it("should sign in successfully", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
      } as Response)
    );

    const { getByTestId } = render(<EditProfileScreen />);

    const passwordInput = getByTestId("passwordInput");
    const updatePasswordButton = getByTestId("updatePasswordButton");

    fireEvent.changeText(passwordInput, "Password123");
    fireEvent.press(updatePasswordButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`${API_HOST}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer ",
        },
        body: JSON.stringify({
          newPassword: "Password123",
        }),
      });
    });
  });

  it("should display an error message for invalid email", async () => {
    global.fetch = jest.fn();

    const { getByTestId } = render(<EditProfileScreen />);

    const passwordInput = getByTestId("passwordInput");
    const updatePasswordButton = getByTestId("updatePasswordButton");

    fireEvent.changeText(passwordInput, "password123");
    fireEvent.press(updatePasswordButton);

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
